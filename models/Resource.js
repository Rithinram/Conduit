const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true
    },
    ventilators: { type: Number, default: 0 },
    availableVentilators: { type: Number, default: 0 },
    oxygenCylinders: { type: Number, default: 0 },
    availableOxygen: { type: Number, default: 0 },
    staffOnDuty: { type: Number, default: 0 },
    ambulancesAvailable: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Resource", resourceSchema);
