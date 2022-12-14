const mongoose = require("mongoose");

const demandSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    demandReference:{ type: String, required: true }, 
    civility: { type: String, required: true },
    fullName: { type: String, required: true },
    email: String,
    primaryPhone: { type: String, required: true },
    secondaryPhone: String,
    governorate: { type: String, required: true },
    delegation: String,
    locality: String,
    service: { type: String, required: true },
    demandDate: { type: Date, required: true },
    demandState: { type: String, required: true },
    quantity: { type: Number },
    missionDate: Date,
    reportState: String,
    price: Number,
    paymentState: String,
    payment: Number,
    notes: String,
    reportFile: String,
    deleted: { type: Boolean, required: true }
});

module.exports = mongoose.model("Demand", demandSchema);