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

router.get('/', forwardAuthenticated, (_req, res) => res.render('login', {
  layout: false
}))

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => res.render('dashboard', {
  user: req.user,
  title:"Dashboard"
}))

router.get('/find', ensureAuthenticated, (req, res) => res.render('search-all', {
  title:"Magic Search", failed:false
}))

router.post('/find', ensureAuthenticated, async (req, res) => {
  const _id = req.body._id

  try{
    if(await Patient.findOne({_id})){res.redirect(`/patient/view/${_id}`); return}
    if(await Exam.findOne({_id})){res.redirect(`/exam/view/${_id}`); return}
    if(await User.findOne({_id})){res.redirect(`/staff/view/${_id}`); return}
    if(await Archive.findOne({_id})){res.redirect(`/admin/archive/view/${_id}`); return}
    if(await Audit.findOne({_id})){res.redirect(`/admin/audit/list`); return}
  } catch(err){
    res.render("search-all",{failed:true})
  }

})

// Login Page
router.get('/login', forwardAuthenticated, (_req, res) => res.render('login', {
  layout: false
}))

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next)
})

// Logout
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', 'You are logged out')
  res.redirect('/login')
})

module.exports = router