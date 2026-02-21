import sys
import os
import json
import joblib
import pandas as pd
import numpy as np

# Suppress warnings
import warnings
warnings.filterwarnings('ignore')

# Set model directory
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

def load_urgency_model():
    model = joblib.load(os.path.join(MODEL_DIR, 'urgency_model.pkl'))
    encoder = joblib.load(os.path.join(MODEL_DIR, 'symptom_encoder.pkl'))
    scaler = joblib.load(os.path.join(MODEL_DIR, 'urgency_scaler.pkl'))
    with open(os.path.join(MODEL_DIR, 'urgency_metadata.json'), 'r') as f:
        meta = json.load(f)
    return model, encoder, scaler, meta

def load_load_model():
    model = joblib.load(os.path.join(MODEL_DIR, 'load_model.pkl'))
    scaler = joblib.load(os.path.join(MODEL_DIR, 'load_scaler.pkl'))
    with open(os.path.join(MODEL_DIR, 'load_metadata.json'), 'r') as f:
        meta = json.load(f)
    return model, scaler, meta

def predict_urgency(data):
    model, encoder, scaler, meta = load_urgency_model()
    df = pd.DataFrame([data])
    s = df['symptom'].iloc[0]
    df['symptom_enc'] = encoder.transform([s])[0] if s in encoder.classes_ else -1
    df['age_group'] = pd.cut(df['age'], bins=[0,18,40,65,100], labels=[0,1,2,3]).astype(int)
    df['risk_count'] = df[['risk_diabetes','risk_hypertension','risk_heart_disease','risk_smoking']].sum(axis=1)
    df['bp_category'] = pd.cut(df['systolic_bp'], bins=[0,90,120,140,160,300], labels=[0,1,2,3,4]).astype(int)
    df['hr_category'] = pd.cut(df['heart_rate'], bins=[0,60,70,80,100,300], labels=[0,1,2,3,4]).astype(int)
    df['temp_category'] = pd.cut(df['temperature'], bins=[0,36,36.5,37.5,38.5,50], labels=[0,1,2,3,4]).astype(int)

    feature_cols = meta['feature_cols']
    X = df[feature_cols].values
    X_scaled = scaler.transform(X)
    pred = model.predict(X_scaled)[0]
    return {"urgency_level": pred}

def predict_load(data):
    model, scaler, meta = load_load_model()
    df = pd.DataFrame([data])
    df['is_weekend'] = 1 if data['day_of_week'] >= 5 else 0
    df['is_night'] = 1 if data['hour'] < 6 or data['hour'] > 20 else 0
    df['is_rush_hour'] = 1 if (data['hour'] in [8, 9, 17, 18]) and (df['is_weekend'].iloc[0] == 0) else 0
    df['hour_sin'] = np.sin(2*np.pi*df['hour']/24)
    df['hour_cos'] = np.cos(2*np.pi*df['hour']/24)
    df['day_sin'] = np.sin(2*np.pi*df['day_of_week']/7)
    df['day_cos'] = np.cos(2*np.pi*df['day_of_week']/7)

    feature_cols = meta['feature_cols']
    X = df[feature_cols].values
    X_scaled = scaler.transform(X)
    pred = model.predict(X_scaled)[0]
    return {
        "predicted_wait_time": float(pred[0]),
        "predicted_icu_occupancy": float(pred[1])
    }

def predict_resource_exhaustion(data):
    model = joblib.load(os.path.join(MODEL_DIR, 'resource_model.pkl'))
    scaler = joblib.load(os.path.join(MODEL_DIR, 'resource_scaler.pkl'))
    with open(os.path.join(MODEL_DIR, 'resource_metadata.json'), 'r') as f:
        meta = json.load(f)
    df = pd.DataFrame([data])
    X = df[meta['feature_cols']].values
    X_scaled = scaler.transform(X)
    pred = model.predict(X_scaled)[0]
    return {
        "vent_exhaustion_hours": float(pred[0]),
        "staff_exhaustion_hours": float(pred[1]),
        "oxy_exhaustion_hours": float(pred[2])
    }

def predict_network_stress(data):
    model = joblib.load(os.path.join(MODEL_DIR, 'stress_model.pkl'))
    scaler = joblib.load(os.path.join(MODEL_DIR, 'stress_scaler.pkl'))
    with open(os.path.join(MODEL_DIR, 'stress_metadata.json'), 'r') as f:
        meta = json.load(f)
    df = pd.DataFrame([data])
    X = df[meta['feature_cols']].values
    X_scaled = scaler.transform(X)
    pred = model.predict(X_scaled)[0]
    return {"stress_index": float(pred)}

def get_realloc_proposals(data):
    model = joblib.load(os.path.join(MODEL_DIR, 'realloc_model.pkl'))
    le = joblib.load(os.path.join(MODEL_DIR, 'target_encoder.pkl'))
    with open(os.path.join(MODEL_DIR, 'realloc_metadata.json'), 'r') as f:
        meta = json.load(f)
    df = pd.DataFrame([data])
    X = df[meta['feature_cols']].values
    pred_idx = model.predict(X)[0]
    target = le.inverse_transform([pred_idx])[0]
    return {
        "recommended_target": target,
        "proposal_confidence": 0.85
    }

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.stdin.read())
        task = input_data.get('task')
        payload = input_data.get('payload')
        
        if task == 'urgency':
            result = predict_urgency(payload)
        elif task == 'load':
            result = predict_load(payload)
        elif task == 'resource_exhaustion':
            result = predict_resource_exhaustion(payload)
        elif task == 'network_stress':
            result = predict_network_stress(payload)
        elif task == 'realloc_proposals':
            result = get_realloc_proposals(payload)
        elif task == 'forecast':
            hours = payload.get('hours', 6)
            results = []
            for i in range(hours):
                current_hour = (payload.get('hour', 0) + i) % 24
                pred = predict_load({
                    'hour': current_hour,
                    'day_of_week': payload.get('day_of_week', 0),
                    'queue_length': payload.get('queue_length', 10),
                    'month': payload.get('month', 1)
                })
                results.append({
                    'hour': current_hour,
                    'predicted_wait_time': pred['predicted_wait_time'],
                    'predicted_icu_occupancy': pred['predicted_icu_occupancy']
                })
            result = {"forecast": results}
        else:
            result = {"error": "Unknown task"}
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
