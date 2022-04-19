const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  gender: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
  phoneLandline: {
    type: String,
  },
  phoneMobile: {
    type: String,
  },
  email: {
    type: String,
  },
  addressHouseNumber: {
    type: String,
  },
  addressLineOne: {
    type: String,
  },
  addressLineTwo: {
    type: String,
  },
  addressCity: {
    type: String,
  },
  addressPostcode: {
    type: String,
  },
  NHSNumber: {
    type: String,
  },
  patientType: {
    type: String,
    required: true,
  },
  GPName: {
    type: String,
  },
  GPAddress: {
    type: String,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
  exams: {
    type: Array,
    default: [],
  },
  archived: {
      type: Boolean,
      default: false
  },
  archiveReason: {
      type: String,
  },
});

const Patient = mongoose.model("Patient", PatientSchema);

module.exports = Patient;
