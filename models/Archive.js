const mongoose = require("mongoose")
const Patient = require("../models/Patient").schema
const Exam = require("../models/Exam").schema

const ArchiveSchema = new mongoose.Schema({
  archiveType: {
    type: String,
  },
  archiveReason: {
    type: String,
  },
  archivedBy: {
    type: String,
  },
  dateArchived: {
    type: Date,
    default: Date.now,
  },
  fieldsChanged: {
    type: String,
  },
  patientDocument: {
    type: Patient,
  },
  examDocument: {
    type: Exam,
  },
  exams:{
    type: [Exam]
  }

}, {collection: "archive"})

const Archive = mongoose.model("Archive", ArchiveSchema)

module.exports = Archive
