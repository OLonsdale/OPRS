const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    "lensType": {
        type:String, //Single Vision, Bifocal, Trifocal, Progressive
        required: true
    },
    "lensMaterial": {
        type:String, //Glass, polycarbonate, high-index 
        required: True
    },
    "stockID": {
        type:String, //for frame
        required: True
    },
    "patientID": {
        type:String, //for for perscription
        required: True
    },
    "coatings": {
        type:String, //Photochromatic, scratch-resistant, anti-reflection, anti-fog, UV-Blocking
    },
    "cost": {
        type:Number //in £
    }
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;