const mongoose = require("mongoose");

const systemStateSchema = new mongoose.Schema({
    globalAlertLevel: { type: String, enum: ['Stable', 'Elevated', 'Critical'], default: 'Stable' },
    activeGlobalAlert: { type: String, default: "" },
    redistributionProtocolActive: { type: Boolean, default: false },

    // Policy Management Fields
    urgencyFilterLevel: { type: Number, default: 1 }, // 1 to 5
    autoRedirectEligibility: {
        feverCough: { type: Boolean, default: true },
        medicationRefill: { type: Boolean, default: true },
        stablePostOp: { type: Boolean, default: false }
    },
    nudgeIntensity: { type: String, enum: ['Informative', 'Balanced', 'Aggressive'], default: 'Balanced' },

    triagePolicy: { type: String, default: "Standard" },
    lastUpdated: { type: Date, default: Date.now },
    lastUpdatedBy: { type: String, default: "System Admin" }
}, { timestamps: true });

module.exports = mongoose.model("SystemState", systemStateSchema);
