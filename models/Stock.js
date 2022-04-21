const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number, //in £
    required: true,
  },
  quantity: {
    type: Number, //num of pairs
    required: true,
  },
  lensHeight: {
    type: Number, //in mm
  },
  lensWidth: {
    type: Number, //in mm
  },
  bridgeWidth: {
    type: Number, //in mm
  },
  armLength: {
    type: Number, //in mm
  },
  colour: {
    type: String,
  },
  material: {
    type: String, //metal, plastic, wood
  },
  brand: {
    type: String, //rayban etc
  },
  weight: {
    type: Number, //in grams
  },
  style: {
    type: String, //rectangle, square, round, oval, cat-eye
  },
  type: {
    type: String, //rimless, semi-rimless, full
  },
}, {collection: "stock"});

const Staff = mongoose.model("Staff", StaffSchema);

module.exports = Staff;
