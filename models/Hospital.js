const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
    name: String,
    location: {
        lat: Number,
        lng: Number
    },
    totalBeds: Number,
    occupiedBeds: Number,
    totalICU: Number,
    occupiedICU: Number,
    erWaitTime: Number,
    staffAvailable: Number,
    staffTotal: Number,
    mriAvailable: Number,
    ctAvailable: Number
}, { timestamps: true });

module.exports = mongoose.model("Hospital", hospitalSchema);