const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const HospitalLoad = require('./models/HospitalLoad');
require('dotenv').config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/conduit');
        console.log("Connected to MongoDB...");

        // Clear existing
        await Hospital.deleteMany({});
        await HospitalLoad.deleteMany({});

        const hospitals = [
            {
                _id: new mongoose.Types.ObjectId('67b7f1e737bd488820c3ccf2'),
                name: 'Central General Hospital',
                city: 'Bengaluru',
                location: { lat: 12.9716, lng: 77.5946 },
                totalBeds: 500,
                availableBeds: 340,
                totalICU: 50,
                availableICU: 12,
                totalERCapacity: 100,
                currentERLoad: 45,
                avgWaitTime: 22,
                rating: '4.8/5',
                isSurgeActive: false
            },
            {
                name: 'City Care Medical Center',
                city: 'Bengaluru',
                location: { lat: 12.9816, lng: 77.5846 },
                totalBeds: 300,
                availableBeds: 45,
                totalICU: 30,
                availableICU: 2,
                totalERCapacity: 80,
                currentERLoad: 75,
                avgWaitTime: 85,
                rating: '4.5/5',
                isSurgeActive: true
            }
        ];

        const savedHospitals = await Hospital.insertMany(hospitals);
        console.log(`Seeded ${savedHospitals.length} hospitals.`);

        // Seed some history for the chart
        const history = [];
        const now = new Date();
        for (let i = 0; i < 24; i++) {
            history.push({
                hospitalId: savedHospitals[0]._id,
                timestamp: new Date(now.getTime() - i * 60 * 60 * 1000),
                erPatients: 20 + Math.floor(Math.random() * 30),
                icuOccupancy: 30 + Math.floor(Math.random() * 20),
                waitTimeMinutes: 15 + Math.floor(Math.random() * 40)
            });
        }
        await HospitalLoad.insertMany(history);
        console.log("Seeded 24 hours of load history.");

        mongoose.disconnect();
        console.log("Seeding complete.");
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seed();