const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Patient = require('../models/Patient')
const Exam = require('../models/Exam')
const Archive = require('../models/Archive')
const {ensureAuthenticated,} = require('../config/auth')

//create patient
router.get('/add', ensureAuthenticated, (req, res) => res.render('patient-add',{title:"Add Patient"}))

//add patient
router.post('/add', ensureAuthenticated, (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    genderOther,
    dateOfBirth,
    landline,
    mobile,
    email,
    addressHouseNumber,
    addressLineOne,
    addressLineTwo,
    addressCity,
    addressPostcode,
    NHSNumber,
    patientType,
    GPName,
    GPAddress,
    notes
  } = req.body

  let gender = req.body.gender
  if (gender === "other") {
    gender = genderOther
  } 

  const newPatient = new Patient({
    firstName,
    middleName,
    lastName,
    gender,
    dateOfBirth,
    phoneLandline:landline,
    phoneMobile:mobile,
    email,
    addressHouseNumber,
    addressLineOne,
    addressLineTwo,
    addressCity,
    addressPostcode,
    NHSNumber,
    patientType,
    GPName,
    GPAddress,
    notes
  })

  newPatient.save()

  req.flash('success_msg', 'Patient has been added')
  res.redirect('/patient/list')
})

//list patients
router.get('/list', ensureAuthenticated, async (req, res) => {
  try {
    const patients = await Patient.find().lean()
    res.render('patient-list', {
      patients,
      title:"List Patients"
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
    const exams = await Exam.find({ patientID: id })
    const optoms = await User.find({ })
    if (patient) {
      res.render('patient-view', {
        patient,
        exams,
        optoms,
        title:`View ${patient.firstName} ${patient.lastName}`
      })
      return
    }
    throw ("not found")
  } catch (error) {
    res.render('errors/404')
    return
  }
})

// edit patient
router.get('/edit/:patientID', ensureAuthenticated, async (req, res) => {
  const id = req.params.patientID

  try {
    const patient = await Patient.findOne({
      _id: id
    })
    if (patient) {
      res.render('patient-edit', {
        patient,
        title:`Edit ${patient.firstName} ${patient.lastName}`
      })
      return
    }
    throw ("not found")
  } catch (error) {
    res.render('errors/404')
    return
  }
})

//edit post
router.post('/edit/:patientID', ensureAuthenticated, async (req, res) => {
  const id = req.params.patientID

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
    editReason,
    notes
  } = req.body


  try {
    const patient = await Patient.findOne({ _id: id })
    if (patient) {
      const archivePatient = new Archive({ 
        archiveType: "Edit",
        archiveReason: `${editReason}`,
        archivedBy: req.user._id,
        patientDocument: patient, //make sure shit isn't changing here
      }) 

      let changes = []
      //filthy code. check each value, if changed, update and add to changes list
      if (patient.firstName != firstName) {
        patient.firstName = firstName
        changes.push("first name")
      }
      if (patient.middleName != middleName) {
        patient.middleName = middleName
        changes.push("middle name")
      }
      if (patient.lastName != lastName) {
        patient.lastName = lastName
        changes.push("last name")
      }
      if (patient.gender != gender) {
        if(gender ==  "other"){
          patient.gender = genderOther
        }
        else patient.gender = gender
        changes.push("gender")
      }
      if (patient.dateOfBirth != dateOfBirth) {
        patient.dateOfBirth = dateOfBirth
        changes.push("date of birth")
      }
      if (patient.landline != landline) {
        patient.landline = landline
        changes.push("landline")
      }
      if (patient.mobile != mobile) {
        patient.mobile = mobile
        changes.push("mobile")
      }
      if (patient.email != email) {
        patient.email = email
        changes.push("email")
      }
      if (patient.addressHouseNumber != addressHouseNumber) {
        patient.addressHouseNumber = addressHouseNumber
        changes.push("house number")
      }
      if (patient.addressLineOne != addressLineOne) {
        patient.addressLineOne = addressLineOne
        changes.push("address line one")
      }
      if (patient.addressLineTwo != addressLineTwo) {
        patient.addressLineTwo = addressLineTwo
        changes.push("address line two")
      }
      if (patient.addressCity != addressCity) {
        patient.addressCity = addressCity
        changes.push("city")
      }
      if (patient.addressPostCode != addressPostCode) {
        patient.addressPostCode = addressPostCode
        changes.push("postcode")
      }
      if (patient.NHSNumber != NHSNumber) {
        patient.NHSNumber = NHSNumber
        changes.push("NHS Number")
      }
      if (patient.patientType != patientType) {
        patient.patientType = patientType
        changes.push("patient type")
      }
      if (patient.GPName != GPName) {
        patient.GPName = GPName
        changes.push("GP name")
      }
      if (patient.GPAddress != GPAddress) {
        patient.GPAddress = GPAddress
        changes.push("GP address")
      }
      if (patient.notes != notes) {
        patient.notes = notes
        changes.push("notes")
      }

      //turn into list, capitalise first letter
      changes = changes.join(", ")
      changes = changes.charAt(0).toUpperCase() + changes.slice(1)

      if(changes){
        patient.save()
        archivePatient.fieldsChanged = changes
        archivePatient.save()
      }

      res.redirect(`/patient/view/${id}`)

      return
    }
    throw ("not found")
  } catch (error) {
    res.render('errors/404')
    return
  }
})

module.exports = router