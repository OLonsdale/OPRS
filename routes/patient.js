/* eslint-disable no-unused-vars */
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const User = require('../models/User')
const Patient = require('../models/Patient')
const Exam = require('../models/Exam')
const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../config/auth')

//create patient
router.get('/add', ensureAuthenticated, (req, res) => res.render('patient-add'))

//add patient
router.post('/add', (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    gender,
    genderOther,
    dateOfBirth,
    landline,
    mobile,
    email,
    addressHouseNumber,
    addressLineOne,
    addressLineTwo,
    addressCity,
    addressPostCode,
    NHSNumber,
    patientType,
    GPName,
    GPAddress,
  } = req.body

  let actualGender
  if (gender === "other") {
    actualGender = genderOther
  } else actualGender = gender

  const newPatient = new Patient({
    firstName,
    middleName,
    lastName,
    gender: actualGender,
    dateOfBirth,
    landline,
    mobile,
    email,
    addressHouseNumber,
    addressLineOne,
    addressLineTwo,
    addressCity,
    addressPostCode,
    NHSNumber,
    patientType,
    GPName,
    GPAddress,
  })

  newPatient.save()

  req.flash('success_msg', 'Patient has been added')
  res.redirect('/add-patient')
})

//list patients
router.get('/list', ensureAuthenticated, async (req, res) => {
  try {
    const patients = await Patient.find().lean()
    res.render('patient-list', {
      patients
    })
  } catch (error) {
    res.render("errors/500")
  }
})

// view patient
router.get('/view/:patientID', ensureAuthenticated, async (req, res) => {
  const id = req.params.patientID

  try {
    const patient = await Patient.findOne({ _id: id })
    const exams = await Exam.find({ patientID:id })
    const optoms = await User.find({ optometrist: true })
    if (patient) { 
      res.render('patient-view', { patient, exams, optoms })
      return
    }
    throw ("not found")
  } catch (error) {
    res.render('errors/404')
    return
  }
})

module.exports = router