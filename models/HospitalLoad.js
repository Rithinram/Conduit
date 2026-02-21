const mongoose = require("mongoose");

const hospitalLoadSchema = new mongoose.Schema({
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true
    },
    timestamp: { type: Date, default: Date.now },
    erPatients: { type: Number, default: 0 },
    icuOccupancy: { type: Number, default: 0 },
    bedOccupancy: { type: Number, default: 0 },
    waitTimeMinutes: { type: Number, default: 0 },
    staffAvailable: { type: Number, default: 0 },
    emergencyCases: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("HospitalLoad", hospitalLoadSchema);
