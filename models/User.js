const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  optometrist: {
    type: Boolean,
    required: true,
  },
  phonePrimary: {
    type: String,
  },
  phoneSecondary: {
    type: String,
  },
  address: {
    type: String,
  },
  email: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now
  }
})

const User = mongoose.model("User", UserSchema)

module.exports = User
