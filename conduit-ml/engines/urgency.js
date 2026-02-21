/**
 * Urgency Classification Engine
 * Statistical ML-based scoring using Random Forest via backend inference.
 */

const API_BASE = "http://localhost:5000/api/ml";

/**
 * Predict urgency level for a patient using the ML model.
 * @param {object} patientData - { symptom, age, severity, systolic_bp, heart_rate, temperature, risk_factors... }
 * @returns {Promise<string>} Urgency level: 'critical'|'high'|'moderate'|'low'
 */
export async function predictUrgency(patientData) {
    try {
        const response = await fetch(`${API_BASE}/urgency`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                symptom: patientData.symptom || 'fever',
                age: patientData.age || 35,
                severity: patientData.severity || 3,
                duration_hours: patientData.duration_hours || 12,
                risk_diabetes: patientData.riskFactors?.diabetic ? 1 : 0,
                risk_hypertension: patientData.riskFactors?.hypertensive ? 1 : 0,
                risk_heart_disease: patientData.riskFactors?.heart_disease ? 1 : 0,
                risk_smoking: patientData.riskFactors?.smoking ? 1 : 0,
                heart_rate: patientData.heart_rate || 75,
                systolic_bp: patientData.systolic_bp || 120,
                temperature: patientData.temperature || 37
            })
        });
        const data = await response.json();
        return data.urgency_level;
    } catch (err) {
        console.error("[ML-Urgency] Prediction failed:", err);
        return 'moderate'; // Fallback
    }
}

/**
 * Legacy support: classifyUrgency.
 * Now returns a promise.
 */
export async function classifyUrgency(condition, age, severity, riskFactors, vitals = {}) {
    const level = await predictUrgency({
        symptom: condition,
        age,
        severity,
        riskFactors,
        ...vitals
    });

    // Map levels to scores for UI consistency
    const scoreMap = { 'critical': 95, 'high': 75, 'moderate': 50, 'low': 25 };
    return { score: scoreMap[level], level };
}
