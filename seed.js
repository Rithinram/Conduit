const axios = require('axios');

const HOSPITALS = [
    {
        name: 'Central General Hospital',
        location: { lat: 12.9716, lng: 77.5946 },
        totalBeds: 200,
        occupiedBeds: 156,
        totalICU: 30,
        occupiedICU: 25,
        erWaitTime: 12,
        staffAvailable: 45,
        staffTotal: 60,
        mriAvailable: 2,
        ctAvailable: 1
    },
    {
        name: 'City Care Medical Center',
        location: { lat: 12.9816, lng: 77.5846 },
        totalBeds: 150,
        occupiedBeds: 138,
        totalICU: 20,
        occupiedICU: 18,
        erWaitTime: 45,
        staffAvailable: 20,
        staffTotal: 40,
        mriAvailable: 1,
        ctAvailable: 0
    },
    {
        name: 'Saints Memorial',
        location: { lat: 12.9616, lng: 77.6046 },
        totalBeds: 180,
        occupiedBeds: 117,
        totalICU: 25,
        occupiedICU: 15,
        erWaitTime: 25,
        staffAvailable: 35,
        staffTotal: 50,
        mriAvailable: 3,
        ctAvailable: 2
    }
];

const PATIENTS = [
    {
        name: 'John Doe',
        age: 45,
        chronicConditions: ['Cardiac', 'Hypertension'],
        triageScore: 85,
        careLevel: 'critical'
    },
    {
        name: 'Jane Smith',
        age: 32,
        chronicConditions: ['Fracture'],
        triageScore: 45,
        careLevel: 'moderate'
    },
    {
        name: 'Robert Brown',
        age: 68,
        chronicConditions: ['Fever', 'Diabetes'],
        triageScore: 15,
        careLevel: 'low'
    }
];

const seedData = async () => {
    try {
        console.log('🌱 Seeding Hospital Data...');
        for (const hospital of HOSPITALS) {
            await axios.post('http://localhost:5000/api/hospitals', hospital);
            console.log(`✅ Added Hospital: ${hospital.name}`);
        }

        console.log('🌱 Seeding Patient Data...');
        for (const patient of PATIENTS) {
            await axios.post('http://localhost:5000/api/patients/register', patient);
            console.log(`✅ Registered Patient: ${patient.name}`);
        }

        console.log('✨ Seeding Complete!');
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    }
};

seedData();
