const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    specialization: { type: String },
    totalBeds: { type: Number, default: 0 },
    availableBeds: { type: Number, default: 0 },
    totalICU: { type: Number, default: 0 },
    availableICU: { type: Number, default: 0 },
    totalERCapacity: { type: Number, default: 0 },
    currentERLoad: { type: Number, default: 0 },
    avgWaitTime: { type: Number, default: 0 },
    rating: { type: String },
    isSurgeActive: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Hospital", hospitalSchema);