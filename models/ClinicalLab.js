const mongoose = require("mongoose");

const clinicalLabSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PatientCase",
        required: true
    },
    testName: { type: String, required: true }, // e.g., "CBC", "Glucose", "HbA1c"
    category: { type: String, enum: ['Blood', 'Imaging', 'Genomics', 'Urine'], default: 'Blood' },
    value: { type: String, required: true },
    units: { type: String },
    referenceRange: { type: String }, // e.g., "70-99 mg/dL"
    status: { type: String, enum: ['Pending', 'Finalized', 'Abnormal', 'Critical'], default: 'Finalized' },
    imagingURL: { type: String }, // Link to DICOM viewer or cloud storage
    performingFacility: { type: String },
    clinicianNotes: { type: String },
    performedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("ClinicalLab", clinicalLabSchema);
