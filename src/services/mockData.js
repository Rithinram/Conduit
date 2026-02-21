export const hospitals = [
    {
        id: 'h1',
        name: 'Central General Hospital',
        location: [12.9716, 77.5946],
        icuAvailability: 85,
        erWaitTime: 12,
        occupancy: 78,
        distance: '2.4 km',
        status: 'stable',
        loadTrend: 'decreasing',
        equipment: { mri: 2, ct: 1, ventilators: 15 }
    },
    {
        id: 'h2',
        name: 'City Care Medical Center',
        location: [12.9816, 77.5846],
        icuAvailability: 42,
        erWaitTime: 45,
        occupancy: 92,
        distance: '4.1 km',
        status: 'critical',
        loadTrend: 'increasing',
        equipment: { mri: 1, ct: 0, ventilators: 5 }
    },
    {
        id: 'h3',
        name: 'Saints Memorial',
        location: [12.9616, 77.6046],
        icuAvailability: 65,
        erWaitTime: 25,
        occupancy: 65,
        distance: '3.8 km',
        status: 'moderate',
        loadTrend: 'stable',
        equipment: { mri: 3, ct: 2, ventilators: 20 }
    }
];

export const systemMetrics = {
    cityStress: 68,
    activeSurge: false,
    communityHealthIndex: 82,
    predictiveSurgeProb: 15
};

export const incomingPatients = [
    { id: 'p1', name: 'John Doe', urgency: 'critical', type: 'Cardiac', arrival: '2 mins' },
    { id: 'p2', name: 'Jane Smith', urgency: 'moderate', type: 'Fracture', arrival: '8 mins' },
    { id: 'p3', name: 'Robert Brown', urgency: 'low', type: 'Fever', arrival: '15 mins' }
];

export const getUrgencyColor = (status) => {
    switch (status) {
        case 'critical': return 'var(--danger)';
        case 'moderate': return 'var(--warning)';
        case 'stable':
        case 'low': return 'var(--success)';
        default: return 'var(--secondary)';
    }
};

