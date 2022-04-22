const express = require('express')
const router = express.Router()
const passport = require('passport')
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