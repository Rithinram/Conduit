# =============================================================================
# Conduit - Complete ML Training Pipeline
# Trains urgency classifier and load predictor, saves models directly to local dir
# =============================================================================

import numpy as np
import pandas as pd
import logging
import sys
import os
import json
import time
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, mean_squared_error, r2_score
import joblib
import warnings
warnings.filterwarnings('ignore')

# -------------------- Configuration & Logging --------------------
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger('conduit_ml_train')

# Directory to save models (local to this script)
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

# -------------------- Data Generation Functions --------------------
# -------------------- Data Generation Functions --------------------
def generate_urgency_data(n_samples=2500):
    """Generate synthetic patient data for urgency classification."""
    symptom_map = {
        'cardiac': 95, 'stroke': 98, 'fracture': 60,
        'fever': 30, 'cough': 20, 'headache': 25,
        'abdominal_pain': 40, 'shortness_of_breath': 80,
        'chest_pain': 95, 'unconscious': 99, 'bleeding': 85
    }
    symptoms = list(symptom_map.keys())
    data = []
    for i in range(n_samples):
        symptom = np.random.choice(symptoms)
        base = symptom_map[symptom]
        age = np.random.randint(1, 95)
        severity = np.random.randint(1, 6)
        duration = np.random.exponential(24)
        duration = min(168, max(0.5, duration))

        risk_diabetes = np.random.choice([0,1], p=[0.85,0.15])
        risk_hyper = np.random.choice([0,1], p=[0.75,0.25])
        risk_heart = np.random.choice([0,1], p=[0.9,0.1])
        risk_smoking = np.random.choice([0,1], p=[0.8,0.2])

        hr = np.clip(np.random.normal(75,15), 40,200)
        bp = np.clip(np.random.normal(120,20), 70,220)
        temp = np.clip(np.random.normal(37,0.8), 35,41)

        # Compute urgency score
        score = base
        if age > 65: score += 15
        elif age < 2: score += 10
        score += (severity-3)*10
        if duration < 1: score += 15
        elif duration > 72: score += 10
        score += risk_diabetes*5 + risk_hyper*5 + risk_heart*15 + risk_smoking*3
        if hr > 100: score += 10
        if hr < 50: score += 15
        if bp > 160: score += 10
        if bp < 90: score += 15
        if temp > 39: score += 10
        if temp < 35: score += 20
        score += np.random.normal(0,5)
        score = np.clip(score, 0, 100)

        if score >= 80: level = 'critical'
        elif score >= 60: level = 'high'
        elif score >= 40: level = 'moderate'
        else: level = 'low'

        data.append([symptom, age, severity, duration,
                     risk_diabetes, risk_hyper, risk_heart, risk_smoking,
                     hr, bp, temp, score, level])

    cols = ['symptom','age','severity','duration_hours',
            'risk_diabetes','risk_hypertension','risk_heart_disease','risk_smoking',
            'heart_rate','systolic_bp','temperature','score','level']
    df = pd.DataFrame(data, columns=cols)
    return df

def generate_load_data(n_samples=3000):
    """Generate synthetic hospital load data."""
    data = []
    for i in range(n_samples):
        hour = np.random.randint(0,24)
        dow = np.random.randint(0,7)
        month = np.random.randint(1,13)
        weekend = 1 if dow >=5 else 0
        night = 1 if hour<6 or hour>20 else 0
        rush = 1 if (hour in [8,9,17,18]) and not weekend else 0

        queue = max(0, int(np.random.randint(5, 100) + (15 if rush else 10) + np.random.normal(0,10)))
        admit_rate = queue * (0.5 + np.random.normal(0,0.1))
        wait = 10 + 2.5*queue + 5*rush + np.random.normal(0,8)
        icu = np.clip(65 + 0.3*queue + 2*night + np.random.normal(0,7), 20, 100)

        data.append([hour, dow, month, weekend, night, rush, queue, admit_rate, wait, icu])

    cols = ['hour','day_of_week','month','is_weekend','is_night','is_rush_hour',
            'queue_length','admission_rate','wait_time','icu_occupancy']
    return pd.DataFrame(data, columns=cols)

def generate_resource_exhaustion_data(n_samples=2000):
    """Generate data for resource depletion forecasting."""
    data = []
    for i in range(n_samples):
        ventilators_avail = np.random.randint(0, 30)
        staff_on_duty = np.random.randint(5, 50)
        oxygen_level = np.random.randint(20, 100)
        patient_acuity_avg = np.random.uniform(1.5, 4.5)
        admission_rate = np.random.uniform(2, 12)

        vent_depletion = np.clip((ventilators_avail * 4) / max(1, (patient_acuity_avg * admission_rate * 0.3)) + np.random.normal(0, 2), 0, 72)
        staff_depletion = np.clip((staff_on_duty / max(1, admission_rate)) * (5 - patient_acuity_avg) * 10 + np.random.normal(0, 4), 0, 48)
        oxy_depletion = np.clip((oxygen_level * 0.8) / max(0.5, (admission_rate * 0.15)) + np.random.normal(0, 5), 0, 120)

        data.append([ventilators_avail, staff_on_duty, oxygen_level, patient_acuity_avg, admission_rate,
                     vent_depletion, staff_depletion, oxy_depletion])

    cols = ['ventilators_avail', 'staff_on_duty', 'oxygen_level', 'patient_acuity_avg', 'admission_rate',
            'vent_exhaustion_hours', 'staff_exhaustion_hours', 'oxy_exhaustion_hours']
    return pd.DataFrame(data, columns=cols)

def generate_network_stress_data(n_samples=1500):
    """Generate data for network stress indexing."""
    data = []
    hospitals = ['City General', 'Mercy Health', 'St. Jude', 'Memorial', 'Regional Trauma']
    for i in range(n_samples):
        hospital_idx = np.random.randint(0, len(hospitals))
        region_load = np.random.uniform(40, 95)
        nearest_neighbor_dist = np.random.uniform(2, 15)
        neighbor_avail = np.random.uniform(10, 80)
        local_icu = np.random.uniform(60, 100)

        stress = np.clip((region_load * 0.5) + (local_icu * 0.3) + (nearest_neighbor_dist * 2) - (neighbor_avail * 0.2) + np.random.normal(0, 5), 0, 100)
        best_target = np.random.choice([h for j, h in enumerate(hospitals) if j != hospital_idx])

        data.append([hospitals[hospital_idx], region_load, nearest_neighbor_dist, neighbor_avail, local_icu, stress, best_target])

    cols = ['hospital', 'region_load', 'neighbor_dist', 'neighbor_avail', 'local_icu', 'stress_index', 'best_target']
    return pd.DataFrame(data, columns=cols)

# -------------------- Preprocessing & Feature Engineering --------------------
def preprocess_urgency(df, is_train=True, encoders=None):
    df = df.copy()
    if is_train:
        le = LabelEncoder()
        df['symptom_enc'] = le.fit_transform(df['symptom'])
    else:
        le = encoders['symptom_encoder']
        df['symptom_enc'] = df['symptom'].map(lambda s: le.transform([s])[0] if s in le.classes_ else -1)

    df['age_group'] = pd.cut(df['age'], bins=[0,18,40,65,100], labels=[0,1,2,3]).astype(int)
    df['risk_count'] = df[['risk_diabetes','risk_hypertension','risk_heart_disease','risk_smoking']].sum(axis=1)
    df['bp_category'] = pd.cut(df['systolic_bp'], bins=[0,90,120,140,160,300], labels=[0,1,2,3,4]).astype(int)
    df['hr_category'] = pd.cut(df['heart_rate'], bins=[0,60,70,80,100,300], labels=[0,1,2,3,4]).astype(int)
    df['temp_category'] = pd.cut(df['temperature'], bins=[0,36,36.5,37.5,38.5,50], labels=[0,1,2,3,4]).astype(int)

    feature_cols = ['symptom_enc','age','severity','duration_hours','risk_diabetes','risk_hypertension','risk_heart_disease','risk_smoking','heart_rate','systolic_bp','temperature','age_group','risk_count','bp_category','hr_category','temp_category']
    X = df[feature_cols].values
    y = df['level'].values

    if is_train:
        scaler = StandardScaler()
        X = scaler.fit_transform(X)
        return X, y, {'symptom_encoder': le, 'scaler': scaler}
    else:
        return encoders['scaler'].transform(X), y

def preprocess_load(df, is_train=True, scaler=None):
    df = df.copy()
    df['hour_sin'] = np.sin(2*np.pi*df['hour']/24)
    df['hour_cos'] = np.cos(2*np.pi*df['hour']/24)
    df['day_sin'] = np.sin(2*np.pi*df['day_of_week']/7)
    df['day_cos'] = np.cos(2*np.pi*df['day_of_week']/7)
    df['month_sin'] = np.sin(2*np.pi*df['month']/12)
    df['month_cos'] = np.cos(2*np.pi*df['month']/12)

    # Advanced Interactions
    df['queue_hour'] = df['queue_length'] * df['hour']
    df['queue_weekend'] = df['queue_length'] * df['is_weekend']
    df['queue_pressure'] = np.log1p(df['queue_length'] * (1 + df['is_rush_hour']))
    df['night_shift_constraint'] = df['is_night'] * df['queue_length']
    df['seasonal_stress'] = df['month'] * df['queue_length']

    feature_cols = [
        'hour', 'day_of_week', 'month', 'is_weekend', 'is_night', 'is_rush_hour', 
        'queue_length', 'hour_sin', 'hour_cos', 'day_sin', 'day_cos', 
        'month_sin', 'month_cos', 'queue_hour', 'queue_weekend', 
        'queue_pressure', 'night_shift_constraint', 'seasonal_stress'
    ]
    
    # Save feature columns in metadata for inference consistency
    if is_train:
        meta_path = os.path.join(MODEL_DIR, 'load_metadata.json')
        meta = {}
        if os.path.exists(meta_path):
            with open(meta_path, 'r') as f: meta = json.load(f)
        meta['feature_cols'] = feature_cols
        with open(meta_path, 'w') as f: json.dump(meta, f, indent=2)

    X = df[feature_cols].values
    y = df[['wait_time', 'icu_occupancy']].values

    if is_train:
        scaler = StandardScaler()
        X = scaler.fit_transform(X)
        return X, y, scaler
    else:
        return scaler.transform(X), y

# -------------------- Model Training --------------------
def train():
    logger.info("🚀 Starting Unified Training for Conduit Intelligence...")
    if not os.path.exists(MODEL_DIR): os.makedirs(MODEL_DIR)

    # 1. Urgency Model
    u_df = generate_urgency_data(2500)
    UX, Uy, Uenc = preprocess_urgency(u_df)
    u_model = RandomForestClassifier(n_estimators=100, random_state=42)
    u_model.fit(UX, Uy)
    joblib.dump(u_model, os.path.join(MODEL_DIR, 'urgency_model.pkl'))
    joblib.dump(Uenc['symptom_encoder'], os.path.join(MODEL_DIR, 'symptom_encoder.pkl'))
    joblib.dump(Uenc['scaler'], os.path.join(MODEL_DIR, 'urgency_scaler.pkl'))

    # 2. Load Model
    l_df = generate_load_data(3000)
    LX, Ly, Lscale = preprocess_load(l_df)
    l_model = RandomForestRegressor(n_estimators=100, random_state=42)
    l_model.fit(LX, Ly)
    joblib.dump(l_model, os.path.join(MODEL_DIR, 'load_model.pkl'))
    joblib.dump(Lscale, os.path.join(MODEL_DIR, 'load_scaler.pkl'))

    # 3. Resource Model
    r_df = generate_resource_exhaustion_data(2000)
    rf_cols = ['ventilators_avail', 'staff_on_duty', 'oxygen_level', 'patient_acuity_avg', 'admission_rate']
    RX = r_df[rf_cols].values
    Ry = r_df[['vent_exhaustion_hours', 'staff_exhaustion_hours', 'oxy_exhaustion_hours']].values
    r_scaler = StandardScaler()
    RX_s = r_scaler.fit_transform(RX)
    r_model = RandomForestRegressor(n_estimators=100, random_state=42)
    r_model.fit(RX_s, Ry)
    joblib.dump(r_model, os.path.join(MODEL_DIR, 'resource_model.pkl'))
    joblib.dump(r_scaler, os.path.join(MODEL_DIR, 'resource_scaler.pkl'))
    with open(os.path.join(MODEL_DIR, 'resource_metadata.json'), 'w') as f:
        json.dump({'feature_cols': rf_cols}, f, indent=2)

    # 4. Stress & Reallocation Models
    s_df = generate_network_stress_data(1500)
    sf_cols = ['region_load', 'neighbor_dist', 'neighbor_avail', 'local_icu']
    SX = s_df[sf_cols].values
    Sy = s_df['stress_index'].values
    s_scaler = StandardScaler()
    SX_s = s_scaler.fit_transform(SX)
    s_model = RandomForestRegressor(n_estimators=100, random_state=42)
    s_model.fit(SX_s, Sy)
    
    le_t = LabelEncoder()
    Sy_t = le_t.fit_transform(s_df['best_target'])
    realloc_model = RandomForestClassifier(n_estimators=100, random_state=42)
    realloc_feat_cols = ['stress_index', 'region_load', 'local_icu']
    realloc_model.fit(s_df[realloc_feat_cols].values, Sy_t)

    joblib.dump(s_model, os.path.join(MODEL_DIR, 'stress_model.pkl'))
    joblib.dump(s_scaler, os.path.join(MODEL_DIR, 'stress_scaler.pkl'))
    with open(os.path.join(MODEL_DIR, 'stress_metadata.json'), 'w') as f:
        json.dump({'feature_cols': sf_cols}, f, indent=2)

    joblib.dump(realloc_model, os.path.join(MODEL_DIR, 'realloc_model.pkl'))
    joblib.dump(le_t, os.path.join(MODEL_DIR, 'target_encoder.pkl'))
    with open(os.path.join(MODEL_DIR, 'realloc_metadata.json'), 'w') as f:
        json.dump({'feature_cols': realloc_feat_cols, 'classes': le_t.classes_.tolist()}, f, indent=2)


    logger.info("✅ All models trained and saved to conduit-ml/models/")

if __name__ == "__main__":
    train()

