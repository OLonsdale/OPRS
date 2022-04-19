const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    lensType: {
        type:String, //Single Vision, Bifocal, Trifocal, Progressive
        required: true
    },
    lensMaterial: {
        type:String, //Glass, polycarbonate, high-index 
        required: true
    },
    stockID: {
        type:String, //for frame
        required: true
    },
    patientID: {
        type:String, //for for perscription
        required: true
    },
    coatings: {
        type:String, //Photochromatic, scratch-resistant, anti-reflection, anti-fog, UV-Blocking
    },
    cost: {
        type:Number //in £
    },
    archived: {
        type: Boolean,
        default: false
    },
    archiveReason: {
        type: String,
    },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;