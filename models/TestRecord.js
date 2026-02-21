const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient"
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital"
    },
    testType: String,
    testDate: Date
}, { timestamps: true });

module.exports = mongoose.model("TestRecord", testSchema);