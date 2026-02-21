const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Helper to determine status from wait time
const getStatusFromWaitTime = (waitTime) => {
    if (waitTime > 40) return 'critical';
    if (waitTime > 20) return 'moderate';
    return 'stable';
};

export const getHospitals = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/hospitals`);
        const data = await response.json();
        return data.map(h => ({
            ...h,
            id: h._id,
            locationName: h.city,
            erWaitTime: h.avgWaitTime || 0,
            icuAvailability: h.totalICU ? Math.round(((h.availableICU) / h.totalICU) * 100) : 0,
            occupancy: h.totalBeds ? Math.round(((h.totalBeds - h.availableBeds) / h.totalBeds) * 100) : 0,
            location: [h.location.lat, h.location.lng],
            distance: `${(Math.random() * 5 + 1).toFixed(1)} km`,
            status: getStatusFromWaitTime(h.avgWaitTime),
            loadTrend: ['stable', 'increasing', 'decreasing'][Math.floor(Math.random() * 3)]
        }));
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        return [];
    }
};

export const getHospitalById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/hospitals/${id}`);
        const h = await response.json();
        return {
            ...h,
            id: h._id,
            locationName: h.city,
            erWaitTime: h.avgWaitTime || 0,
            icuAvailability: h.totalICU ? Math.round(((h.availableICU) / h.totalICU) * 100) : 0,
            occupancy: h.totalBeds ? Math.round(((h.totalBeds - h.availableBeds) / h.totalBeds) * 100) : 0,
            location: [h.location.lat, h.location.lng],
            status: getStatusFromWaitTime(h.avgWaitTime)
        };
    } catch (error) {
        console.error('Error fetching hospital by ID:', error);
        return null;
    }
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
        const response = await fetch(`${API_BASE_URL}/load`);
        const data = await response.json();
        // For now returning mock-like metrics using backend status
        return {
            cityStress: 68, // Placeholder
            activeSurge: false,
            communityHealthIndex: 82,
            predictiveSurgeProb: 15
        };
    } catch (error) {
        console.error('Error fetching system metrics:', error);
        return null;
    }
};

export const getResources = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/resources`);
        const data = await response.json();
        return data.map(r => ({
            ...r,
            id: r._id,
            hospitalName: r.hospitalId?.name || 'Unknown Facility'
        }));
    } catch (error) {
        console.error('Error fetching resources:', error);
        return [];
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

// ADMIN OVERRIDES & SYSTEM STATE
export const getSystemState = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/system-state`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching system state:', error);
        return null;
    }
};

export const dispatchRedistribution = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/redistribute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error dispatching redistribution:', error);
        return { success: false, message: 'API Connection Failed' };
    }
};

export const resetSystemState = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/reset`, {
            method: 'POST'
        });
        return await response.json();
    } catch (error) {
        console.error('Error resetting system:', error);
        return { success: false };
    }
};

export const broadcastAlert = async (alertData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/alert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error broadcasting alert:', error);
        return { success: false };
    }
};

export const updatePolicy = async (policyData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/update-policy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(policyData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating policy:', error);
        return { success: false };
    }
};


export const simulatePolicy = async (policyData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/simulate-policy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(policyData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error simulating policy:', error);
        return { success: false };
    }
};

export const transferResource = async (transferData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/transfer-resource`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transferData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error transferring resource:', error);
        return { success: false, message: 'API Connection Failed' };
    }
};

export const bulkRedirect = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/bulk-redirect`, {
            method: 'POST'
        });
        return await response.json();
    } catch (error) {
        console.error('Error in bulk redirect:', error);
        return { success: false, message: 'API Connection Failed' };
    }
};

export const getForecast = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/ml/forecast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching forecast:', error);
        return { forecast: [] };
    }
};

export const predictResourceExhaustion = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/ml/resource-forecast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (error) {
        console.error('Resource prediction error:', error);
        return { vent_exhaustion_hours: 0, staff_exhaustion_hours: 0, oxy_exhaustion_hours: 0 };
    }
};

export const getReallocationProposals = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/ml/realloc-proposals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (error) {
        console.error('Reallocation proposal error:', error);
        return { recommended_target: "N/A", proposal_confidence: 0 };
    }
};

export const getNetworkStress_ML = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/ml/network-stress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await response.data;
    } catch (error) {
        console.error('Network stress error:', error);
        return { stress_index: 0 };
    }
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
