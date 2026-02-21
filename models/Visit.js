const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient"
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital"
    },
    triageLevel: String,
    currentStage: String,
    predictedWaitTime: Number,
    actualWaitTime: Number
}, { timestamps: true });

module.exports = mongoose.model("Visit", visitSchema);