const API_BASE_URL = 'http://localhost:5000/api';

export const getHospitals = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/hospitals`);
        const data = await response.json();
        // Transform backend model to frontend expected format if necessary
        return data.map(h => ({
            ...h,
            id: h._id,
            icuAvailability: h.totalICU ? Math.round(((h.totalICU - h.occupiedICU) / h.totalICU) * 100) : 0,
            occupancy: h.totalBeds ? Math.round((h.occupiedBeds / h.totalBeds) * 100) : 0,
            location: [h.location.lat, h.location.lng],
            status: getStatusFromWaitTime(h.erWaitTime),
            loadTrend: 'stable', // Placeholder or calculated
            equipment: {
                mri: h.mriAvailable,
                ct: h.ctAvailable,
                ventilators: h.ventilatorsAvailable || 0 // Default since not in model yet
            }
        }));
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        return [];
    }
};

// Helper to derive urgency from triageScore or careLevel
const getUrgencyFromPatient = (p) => {
    if (p.triageScore != null) {
        if (p.triageScore >= 8) return 'critical';
        if (p.triageScore >= 5) return 'moderate';
        return 'low';
    }
    if (p.careLevel) {
        const level = p.careLevel.toLowerCase();
        if (level === 'icu' || level === 'critical') return 'critical';
        if (level === 'general' || level === 'moderate') return 'moderate';
        return 'low';
    }
    return 'moderate';
};

export const getPatients = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/patients`);
        const data = await response.json();
        return data.map(p => ({
            ...p,
            id: p._id,
            arrival: '10 mins', // Placeholder as not in model
            type: p.chronicConditions?.join(', ') || 'General'
        }));
    } catch (error) {
        console.error('Error fetching patients:', error);
        return [];
    }
};

// Smart Triage Services
export const getTriageQueue = async (hospitalId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/triage/queue/${hospitalId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching triage queue:', error);
        return [];
    }
};

export const updateVitals = async (patientId, data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/triage/update-vitals/${patientId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating vitals:', error);
        return { success: false };
    }
};

export const updateTriageStatus = async (patientId, status) => {
    try {
        const response = await fetch(`${API_BASE_URL}/triage/update-status/${patientId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating triage status:', error);
        return { success: false };
    }
};

export const getSystemMetrics = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/status`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching system metrics:', error);
        return null;
    }
};

export const registerPatient = async (patientData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/patients/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error registering patient:', error);
        return null;
    }
};

// Helper to determine status from wait time
const getStatusFromWaitTime = (waitTime) => {
    if (waitTime > 40) return 'critical';
    if (waitTime > 20) return 'moderate';
    return 'stable';
};

export const getUrgencyColor = (status) => {
    switch (status) {
        case 'critical': return 'var(--danger)';
        case 'moderate': return 'var(--warning)';
        case 'stable':
        case 'low': return 'var(--success)';
        default: return 'var(--secondary)';
    }
};
