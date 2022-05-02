const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/User')
const Patient = require('../models/Patient')
const Exam = require('../models/Exam')
const Archive = require('../models/Archive')
const Audit = require('../models/Audit')
const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../config/auth')

//Login page, if already logged in, you'll get shunted to the dashboard
router.get('/', forwardAuthenticated, (_req, res) => res.render('pages/index/login', {
  layout: false //no layout, meaning no navbar. layout.ejs not used
}))

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true,
  })(req, res, next)
})

// Logout
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', 'You are logged out')
  res.redirect('/')
})
// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => res.render('pages/index/dashboard', {
  user: req.user,
  title:"Dashboard"
}))

// Magic find page
router.get('/find', ensureAuthenticated, (req, res) => res.render('pages/index/search-all', {
  title:"Magic Search", failed:false
}))

//Find any document by the ID number
router.post('/find', ensureAuthenticated, async (req, res) => {
  const _id = req.body._id

  try{
    if(await Patient.findById(_id)){res.redirect(`/patient/view/${_id}`); return}
    if(await Exam.findById(_id)){res.redirect(`/exam/view/${_id}`); return}
    if(await User.findById(_id)){res.redirect(`/staff/view/${_id}`); return}
    if(await Archive.findById(_id)){res.redirect(`/admin/archive/view/${_id}`); return}
    if(await Audit.findById(_id)){res.redirect(`/admin/audit/list`); return}
  } catch(err){
    res.render("pages/index/search-all",{failed:true})
  }
})

module.exports = router