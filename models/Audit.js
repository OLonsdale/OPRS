const mongoose = require("mongoose")

const AuditSchema = new mongoose.Schema({
  event: {
    type: String,
  },
  user: {
    type: String,
  },
  IP: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },

}, {collection: "audit"})

const Audit = mongoose.model("Audit", AuditSchema)

module.exports = Audit
