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

    // Granular Supply Chain Management
    inventoryItems: [{
        category: { type: String, enum: ['Equipment', 'Consumable', 'Medication'], required: true },
        itemName: { type: String, required: true },
        lotNumber: { type: String },
        expiryDate: { type: Date },
        quantity: { type: Number, default: 0 },
        status: { type: String, enum: ['Available', 'Expiring Soon', 'Expired', 'Maintenance'], default: 'Available' }
    }],
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });


module.exports = mongoose.model("Resource", resourceSchema);
