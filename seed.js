const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Hospital = require("./models/Hospital");
const PatientCase = require("./models/PatientCase");
const HospitalLoad = require("./models/HospitalLoad");
const Resource = require("./models/Resource");

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected for Seeding"))
    .catch(err => console.log(err));

const seedData = async () => {
    await User.deleteMany();
    await Hospital.deleteMany();
    await PatientCase.deleteMany();
    await HospitalLoad.deleteMany();
    await Resource.deleteMany();

    console.log("Old Data Deleted");

    // ---------------- REAL HOSPITALS ----------------
    const hospitalData = [
        { name: "Apollo Hospitals - Greams Road", city: "Chennai", beds: 550, icu: 80, lat: 13.063, lng: 80.252 },
        { name: "Sri Ramachandra Medical Centre", city: "Chennai", beds: 800, icu: 100, lat: 13.036, lng: 80.142 },
        { name: "SIMS Hospital", city: "Chennai", beds: 345, icu: 60, lat: 13.051, lng: 80.209 },
        { name: "Government General Hospital", city: "Chennai", beds: 2000, icu: 150, lat: 13.082, lng: 80.275 },
        { name: "PSG Hospitals", city: "Coimbatore", beds: 700, icu: 90, lat: 11.024, lng: 77.014 },
        { name: "Ganga Medical Centre", city: "Coimbatore", beds: 650, icu: 85, lat: 11.018, lng: 76.960 },
        { name: "Meenakshi Mission Hospital", city: "Madurai", beds: 500, icu: 70, lat: 9.957, lng: 78.140 },
        { name: "Sudha Hospital", city: "Erode", beds: 300, icu: 40, lat: 11.341, lng: 77.717 },
        { name: "Ishwarya Hospital", city: "Chennai", beds: 200, icu: 30, lat: 13.011, lng: 80.217 },
        { name: "Kauvery Hospital", city: "Chennai", beds: 400, icu: 75, lat: 13.033, lng: 80.252 }
    ];

    const hospitals = [];

    for (let h of hospitalData) {
        const hospital = await Hospital.create({
            name: h.name,
            city: h.city,
            location: { lat: h.lat, lng: h.lng },
            specialization: ["General", "Cardiac", "Neuro", "Trauma"][Math.floor(Math.random() * 4)],
            totalBeds: h.beds,
            availableBeds: Math.floor(h.beds * Math.random()),
            totalICU: h.icu,
            availableICU: Math.floor(h.icu * Math.random()),
            totalERCapacity: 150,
            currentERLoad: Math.floor(Math.random() * 150),
            avgWaitTime: Math.floor(Math.random() * 120),
            rating: (Math.random() * 2 + 3).toFixed(1),
            isSurgeActive: false
        });

        hospitals.push(hospital);
    }

    console.log("10 Real Hospitals Added");

    // ---------------- USERS ----------------
    const roles = ["user", "hospital", "admin"];

    for (let i = 1; i <= 10; i++) {
        await User.create({
            name: `User ${i}`,
            email: `user${i}@health.com`,
            password: "123456",
            role: roles[i % 3],
            hospitalId: roles[i % 3] === "hospital" ? hospitals[i % 10]._id : null
        });
    }

    console.log("10 Users Added");

    // ---------------- PATIENT CASES ----------------
    const urgencyLevels = ["Low", "Moderate", "High", "Critical"];
    const careLevels = ["Home", "Clinic", "Hospital", "ER"];
    const genders = ["Male", "Female"];

    for (let i = 1; i <= 30; i++) {
        await PatientCase.create({
            patientName: `Patient ${i}`,
            age: Math.floor(Math.random() * 75) + 18,
            gender: genders[Math.floor(Math.random() * 2)],
            symptoms: ["Fever", "Chest Pain", "Breathing Issue", "Headache"]
                .sort(() => 0.5 - Math.random())
                .slice(0, 2),
            severity: Math.floor(Math.random() * 10) + 1,
            durationHours: Math.floor(Math.random() * 72),
            riskFactors: ["Diabetes", "Hypertension", "Asthma"]
                .sort(() => 0.5 - Math.random())
                .slice(0, 1),
            heartRate: 60 + Math.floor(Math.random() * 80),
            bloodPressure: `${100 + Math.floor(Math.random() * 40)}/${70 + Math.floor(Math.random() * 20)}`,
            oxygenLevel: 85 + Math.floor(Math.random() * 15),
            urgencyLevel: urgencyLevels[Math.floor(Math.random() * 4)],
            recommendedCare: careLevels[Math.floor(Math.random() * 4)],
            hospitalAssigned: hospitals[Math.floor(Math.random() * 10)]._id,
            outcomeStatus: ["Admitted", "Discharged", "Observation"][Math.floor(Math.random() * 3)],
            createdAt: new Date()
        });
    }

    console.log("30 Patient Cases Added");

    // ---------------- LOAD RECORDS ----------------
    for (let i = 0; i < 20; i++) {
        const randomHospital = hospitals[Math.floor(Math.random() * 10)];

        await HospitalLoad.create({
            hospitalId: randomHospital._id,
            timestamp: new Date(Date.now() - i * 3600000),
            erPatients: Math.floor(Math.random() * 200),
            icuOccupancy: Math.floor(Math.random() * 100),
            bedOccupancy: Math.floor(Math.random() * 500),
            waitTimeMinutes: Math.floor(Math.random() * 180),
            staffAvailable: 20 + Math.floor(Math.random() * 50),
            emergencyCases: Math.floor(Math.random() * 30)
        });
    }

    console.log("20 Load Records Added");

    // ---------------- RESOURCE RECORDS ----------------
    for (let i = 0; i < hospitals.length; i++) {
        await Resource.create({
            hospitalId: hospitals[i]._id,
            ventilators: 20 + Math.floor(Math.random() * 30),
            availableVentilators: Math.floor(Math.random() * 15),
            oxygenCylinders: 150,
            availableOxygen: 50 + Math.floor(Math.random() * 100),
            staffOnDuty: 40 + Math.floor(Math.random() * 60),
            ambulancesAvailable: Math.floor(Math.random() * 6),
            lastUpdated: new Date()
        });
    }

    console.log("10 Resource Records Added");

    console.log("DATABASE SEEDED SUCCESSFULLY 🚀");
    process.exit();
};

seedData();