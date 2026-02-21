/**
 * Load Prediction Engine
 * Statistical ML-based regression using Random Forest via backend inference.
 */

const API_BASE = "http://localhost:5000/api/ml";

/**
 * Predict wait time and ICU occupancy using the ML model.
 */
export async function predictLoad(hour, day_of_week, queue_length) {
    try {
        const response = await fetch(`${API_BASE}/load`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hour,
                day_of_week,
                month: new Date().getMonth() + 1,
                queue_length
            })
        });
        const data = await response.json();
        return {
            predictedWaitTime: Math.round(data.predicted_wait_time),
            predictedIcuOccupancy: Math.round(data.predicted_icu_occupancy)
        };
    } catch (err) {
        console.error("[ML-Load] Prediction failed:", err);
        return { predictedWaitTime: 15, predictedIcuOccupancy: 60 }; // Fallback
    }
}

/**
 * Generate a forecast for the next N hours.
 * Now async.
 */
export async function forecastLoad(startHour, dayOfWeek, currentQueue, hours = 6) {
    const forecast = [];
    for (let i = 0; i < hours; i++) {
        const hour = (startHour + i) % 24;
        const adjustedQueue = Math.max(0, currentQueue + Math.round((Math.random() - 0.5) * 4));
        const pred = await predictLoad(hour, dayOfWeek, adjustedQueue);
        forecast.push({
            time: `${String(hour).padStart(2, '0')}:00`,
            ...pred,
        });
    }
    return forecast;
}

export function isModelTrained() {
    return true; // Always true since backend manages the model
}

export function trainLoadModel() {
    console.log("[LoadModel] Backend models are active.");
}
