
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')

const Exam = require('../models/Exam')
const { ensureAuthenticated, } = require('../config/auth')

router.get('/add', ensureAuthenticated, (_req, res) => res.render('pages/staff/staff-add',{title:"Add Staff"}))

router.post('/add', (req, res) => {
  const {
    name,
    username,
    password,
    password2,
    phonePrimary,
    phoneSecondary,
    email,
    address,
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

  // check password is at least 8 chars, (fairly weak requirements, yes)
  if (password.length < 8) {
    errors.push({
      msg: 'Password must be at least 8 characters'
    })
  }

  // display errors if there are any
  if (errors.length > 0) {
    res.render('pages/staff/staff-add', {
      title:"Add Staff",
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
      res.render('pages/staff/staff-add', {
        title:"Add Staff",
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
      phonePrimary,
      phoneSecondary,
      email,
      address,
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
            res.redirect('/list/staff')
          })
          .catch((err) => console.log(err))
      })
    })
  })
})

router.get('/list', ensureAuthenticated, async (req, res) => {

  //number of elements to show per page
  const RESULTS_PER_PAGE = 25
  //cleans search queries
  const query = Object.entries(req.query).reduce((obj,[key,value]) => (value ? (obj[key]=value, obj) : obj), {})

  //limit how many documents skipped for search, (goes up in 50's)
  //default 0 if not specified in url
  const skip = (Number(query.page) || 0) * RESULTS_PER_PAGE
  
  try {
    const users = await User.find().skip(skip).limit(RESULTS_PER_PAGE)
    const totalPages = Math.ceil( await User.estimatedDocumentCount() / RESULTS_PER_PAGE )
    res.render('pages/staff/staff-list', {
      title:"List Staff",
      users,
      totalPages
    })
  } catch (error) {
    res.render("errors/500")
  }
})

router.get('/view/:staffID', ensureAuthenticated, async (req, res) => {

  const id = req.params.staffID

  try {

    //number of elements to show per page
    const RESULTS_PER_PAGE = 25
    //cleans search queries
    const query = Object.entries(req.query).reduce((obj,[key,value]) => (value ? (obj[key]=value, obj) : obj), {})
    //limit how many documents skipped for search, (goes up in 50's)
    //default 0 if not specified in url
    const skip = (Number(query.page) || 0) * RESULTS_PER_PAGE
    const staff = await User.findById(id)
    const exams = await Exam.find({ performingOptometrist: id }).skip(skip).limit(RESULTS_PER_PAGE)
    const totalPages = Math.ceil(exams.length / RESULTS_PER_PAGE)

    if (staff) { 
      res.render('pages/staff/staff-view', { staff, exams, title:`View ${staff.username}`,totalPages })
      return
    }
    throw ("not found")
  } catch (error) {
    res.render('errors/404')
  }
})

router.get('/edit/:staffID', ensureAuthenticated, async (req, res) => {

  const id = req.params.staffID

  try {
    const staff = await User.findById(id)
    if (staff) { 
      res.render('pages/staff/staff-edit', { staff, title:`Edit ${staff.username}`,})
      return
    }
    throw ("not found")
  } catch (error) {
    res.render('errors/404')
  }
})

router.post('/edit/:staffID', ensureAuthenticated, async (req, res) => {
  const id = req.params.staffID
  let staff

  try { staff = await User.findById(id) }
  catch (error) { res.render('errors/500'); return }

  const {
    name,
    password,
    password2,
    phonePrimary,
    phoneSecondary,
    email,
    address,
  } = req.body
  const optometrist = 'optometrist' in req.body

  if(staff.name !== name){ staff.name = name }

  if(staff.optometrist !== optometrist) { staff.optometrist = optometrist}

  if(staff.phonePrimary !== phonePrimary) { staff.phonePrimary = phonePrimary}

  if(staff.phoneSecondary !== phoneSecondary) { staff.phoneSecondary = phoneSecondary}

  if(staff.address !== address) { staff.address = address}

  if(staff.email !== email) { staff.email = email}


  if(password){
    const errors = []
    // check passwords match
    if (password != password2) {
      errors.push({
        msg: 'Passwords do not match'
      })
    }

    // check password is at least 8 chars
    if (password.length < 8) {
      errors.push({
        msg: 'Password must be at least 8 characters'
      })
    }

    if (errors.length > 0) {
      res.render('pages/staff/staff-edit', {
        staff,
        errors,
        title:`Edit ${staff.username}`
      })
      return
    }

    bcrypt.genSalt(10, (_err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err
        // replaces clear password with hashed
        staff.password = hash
        // saves to db
        staff.save()
          // then passes message and reloads page
          .then(() => {
            res.redirect('/list/staff')
          })
          .catch((err) => console.log(err))
      })
    })
  }

  else staff.save()


  res.redirect(`/staff/view/${id}`)
})

module.exports = router