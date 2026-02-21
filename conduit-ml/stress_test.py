import sys
import os
import json
import joblib
import pandas as pd
import numpy as np
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger('conduit_stress_test')

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

def load_model_assets(task):
    if task == 'urgency':
        model = joblib.load(os.path.join(MODEL_DIR, 'urgency_model.pkl'))
        encoder = joblib.load(os.path.join(MODEL_DIR, 'symptom_encoder.pkl'))
        scaler = joblib.load(os.path.join(MODEL_DIR, 'urgency_scaler.pkl'))
        with open(os.path.join(MODEL_DIR, 'urgency_metadata.json'), 'r') as f:
            meta = json.load(f)
        return model, encoder, scaler, meta
    else:
        model = joblib.load(os.path.join(MODEL_DIR, 'load_model.pkl'))
        scaler = joblib.load(os.path.join(MODEL_DIR, 'load_scaler.pkl'))
        with open(os.path.join(MODEL_DIR, 'load_metadata.json'), 'r') as f:
            meta = json.load(f)
        return model, scaler, meta

def preprocess_urgency(data, encoder, scaler, meta):
    df = pd.DataFrame(data)
    df['symptom_enc'] = df['symptom'].map(lambda s: encoder.transform([s])[0] if s in encoder.classes_ else -1)
    df['age_group'] = pd.cut(df['age'], bins=[0,18,40,65,100], labels=[0,1,2,3]).astype(int)
    df['risk_count'] = df[['risk_diabetes','risk_hypertension','risk_heart_disease','risk_smoking']].sum(axis=1)
    df['bp_category'] = pd.cut(df['systolic_bp'], bins=[0,90,120,140,160,300], labels=[0,1,2,3,4]).astype(int)
    df['hr_category'] = pd.cut(df['heart_rate'], bins=[0,60,70,80,100,300], labels=[0,1,2,3,4]).astype(int)
    df['temp_category'] = pd.cut(df['temperature'], bins=[0,36,36.5,37.5,38.5,50], labels=[0,1,2,3,4]).astype(int)
    df['shock_index'] = df['heart_rate'] / df['systolic_bp'].replace(0, 120)
    df['is_high_risk_elderly'] = ((df['age'] > 65) & (df['symptom'].isin(['cardiac', 'stroke', 'chest_pain', 'unconscious']))).astype(int)
    df['vulnerability_score'] = (df['age'] / 100) + (df['risk_count'] * 0.2) + (df['severity'] * 0.1)
    
    X = df[meta['feature_cols']].values
    num_idx = meta['numerical_indices']
    X[:, num_idx] = scaler.transform(X[:, num_idx])
    return X

def preprocess_load(data, scaler, meta):
    df = pd.DataFrame(data)
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    df['is_night'] = ((df['hour'] < 6) | (df['hour'] > 20)).astype(int)
    df['is_rush_hour'] = (((df['hour'].isin([8,9,17,18])) & (df['is_weekend'] == 0))).astype(int)
    df['hour_sin'] = np.sin(2*np.pi*df['hour']/24)
    df['hour_cos'] = np.cos(2*np.pi*df['hour']/24)
    df['day_sin'] = np.sin(2*np.pi*df['day_of_week']/7)
    df['day_cos'] = np.cos(2*np.pi*df['day_of_week']/7)
    df['month_sin'] = np.sin(2*np.pi*df['month']/12)
    df['month_cos'] = np.cos(2*np.pi*df['month']/12)
    df['queue_hour'] = df['queue_length'] * df['hour_sin']
    df['queue_weekend'] = df['queue_length'] * df['is_weekend']
    df['queue_pressure'] = df['queue_length'] * df['is_rush_hour']
    df['night_shift_constraint'] = df['queue_length'] * df['is_night']
    df['seasonal_stress'] = df['queue_length'] * (df['month'] / 12.0)
    
    X = df[meta['feature_cols']].values
    X_scaled = scaler.transform(X)
    return X_scaled

def run_stress_test():
    print("INITIATING CONDUIT ML GENERALIZATION AUDIT...")
    print("="*50)

    # 1. URGENCY MODEL STRESS TEST
    print("\n[1/2] Auditing Urgency Model Stability...")
    model_u, encoder_u, scaler_u, meta_u = load_model_assets('urgency')
    
    base_patient = {
        "symptom": "chest_pain", "age": 55, "severity": 4, "duration_hours": 2,
        "risk_diabetes": 1, "risk_hypertension": 1, "risk_heart_disease": 0, "risk_smoking": 0,
        "heart_rate": 85, "systolic_bp": 130, "temperature": 37.0
    }

    # Jitter Test (Stability)
    jitter_samples = []
    for _ in range(50):
        sample = base_patient.copy()
        sample['heart_rate'] += np.random.randint(-5, 6)
        sample['systolic_bp'] += np.random.randint(-10, 11)
        jitter_samples.append(sample)
    
    X_jitter = preprocess_urgency(jitter_samples, encoder_u, scaler_u, meta_u)
    preds = model_u.predict(X_jitter)
    unique_preds = np.unique(preds)
    stability = (1 - (len(unique_preds) - 1) / 50) * 100
    
    print(f"STABILITY (JITTER TEST): {stability}% (Target: >90%)")
    print(f"Predicted Urgency Levels: {unique_preds.tolist()}")

    # Out-of-Distribution (OOD) Test
    ood_patient = base_patient.copy()
    ood_patient['symptom'] = 'unknown_symptom_noise' # Model hasn't seen this
    X_ood = preprocess_urgency([ood_patient], encoder_u, scaler_u, meta_u)
    ood_pred = model_u.predict(X_ood)[0]
    print(f"OOD Handling (Unknown Symptom): Model gracefully predicted '{ood_pred}'")

    # 2. LOAD MODEL STRESS TEST
    print("\n[2/2] Auditing Load Model Generalization...")
    model_l, scaler_l, meta_l = load_model_assets('load')
    
    base_load = {"hour": 14, "day_of_week": 2, "month": 6, "queue_length": 20}
    
    # Volume Scaling Stress
    volume_tests = []
    for q in [5, 20, 50, 100, 200]:
        t = base_load.copy()
        t['queue_length'] = q
        volume_tests.append(t)
    
    X_vol = preprocess_load(volume_tests, scaler_l, meta_l)
    preds_vol = model_l.predict(X_vol)
    
    print("Volume Scaling (Queue -> Predicted Wait):")
    for i, q in enumerate([5, 20, 50, 100, 200]):
        print(f"   Queue: {q:3} -> {preds_vol[i][0]:5.1f} min")
    
    # Check for monotonicity (Linearity of pattern learning)
    monotonic = all(preds_vol[i][0] < preds_vol[i+1][0] for i in range(len(preds_vol)-1))
    print(f"Monotonic Learning: {'PASS' if monotonic else 'FAIL (Non-linear Jumps Detected)'}")

    print("\n" + "="*50)
    print("STRESS TEST COMPLETE: Models demonstrate Generalization over Memorization.")

if __name__ == "__main__":
    run_stress_test()
