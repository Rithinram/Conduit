const mongoose = require("mongoose");

const auditTrailSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    actionType: {
        type: String,
        required: true,
        enum: ['POLICY_UPDATE', 'RESOURCE_TRANSFER', 'BULK_REDIRECT', 'USER_MANAGEMENT', 'SYSTEM_RESET']
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: false }, // ID of the hospital, patient, or policy changed
    previousState: { type: mongoose.Schema.Types.Mixed },
    newState: { type: mongoose.Schema.Types.Mixed },
    reason: { type: String },
    ipAddress: { type: String },
    severity: { type: String, enum: ['Info', 'Warning', 'Critical'], default: 'Info' }
}, { timestamps: true });

module.exports = mongoose.model("AuditTrail", auditTrailSchema);
