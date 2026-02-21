const mongoose = require("mongoose");

const handoffRecordSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PatientCase",
        required: true
    },
    fromHospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true
    },
    toHospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true
    },
    clinicalNote: { type: String, required: true },
    urgencyAtHandoff: { type: String, enum: ['Stable', 'Guarded', 'Critical'], default: 'Stable' },
    transferStatus: {
        type: String,
        enum: ['Proposed', 'En Route', 'Accepted', 'Completed', 'Rejected'],
        default: 'Proposed'
    },
    estimatedArrival: { type: Date },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("HandoffRecord", handoffRecordSchema);
