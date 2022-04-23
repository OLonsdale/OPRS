const express = require('express')
const router = express.Router()
const User = require('../models/User')
// const Patient = require('../models/Patient')
// const Exam = require('../models/Exam')
const Archive = require('../models/Archive')
const {ensureAuthenticated,} = require('../config/auth')


// Admin Dash
router.get('/admin', ensureAuthenticated, (_req, res) => res.render('admin', {
  title:"Admin"
}))

//archive

router.get('/archive/list', ensureAuthenticated, async (req, res) => {
  try {
    const archive = await Archive.find().lean()
    const optoms = await User.find().lean()
    res.render('archive-list', {
      elements: archive,
      title:"List Patients",
      optoms
    })
  } catch (error) {
    res.render("errors/500")
  }
})



//logs





module.exports = router