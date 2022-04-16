/* eslint-disable no-unused-vars */
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Patient = require('../models/Patient')
const Exam = require('../models/Exam')
const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../config/auth')


router.get('/add', ensureAuthenticated, (_req, res) => res.render('staff-add'))

router.post('/add', (req, res) => {
  const {
    name,
    username,
    password,
    password2
  } = req.body
  const optometrist = 'optometrist' in req.body

  const errors = []

  // check all fields are filled. Might switch to client side
  if (!name || !username || !password || !password2) {
    errors.push({
      msg: 'Please fill out all fields'
    })
  }

  // check passwords match
  if (password != password2) {
    errors.push({
      msg: 'Passwords do not match'
    })
  }

  // check password is at least 4 chars, (yes it's weak)
  if (password.length < 4) {
    errors.push({
      msg: 'Password must be at least 4 characters'
    })
  }

  // display errors if there are any
  if (errors.length > 0) {
    res.render('staff-add', {
      errors,
      name,
      username,
      password,
      password2,
      optometrist,
    })
    return
  }

  // Look in the db for the username
  User.findOne({username})
  .then((user) => {
    if (user) {
      errors.push({ msg: 'Username already in use' })
      res.render('staff-add', {
        errors,
        name,
        username,
        password,
        password2,
      })
      // if user if found, return.
      return
    }

    // create instance of user schema
    const newUser = new User({
      name,
      optometrist,
      username,
      password,
    })

    // hash and salt password, and push whole thing to the database
    bcrypt.genSalt(10, (_err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err
        // replaces clear password with hashed
        newUser.password = hash
        // saves to db
        newUser.save()
          // then passes message and reloads page
          .then(() => {
            req.flash('success_msg', 'User is now registered')
            res.redirect('/add-staff')
          })
          .catch((err) => console.log(err))
      })
    })
  })
})

router.get('/list', ensureAuthenticated, async (req, res) => {
  try {
    const users = await User.find()
    res.render('staff-list', {
      users
    })
  } catch (error) {
    res.render("errors/500")
  }
})

module.exports = router