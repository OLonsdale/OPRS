const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Patient = require('../models/Patient')
const Exam = require('../models/Exam')
const Archive = require('../models/Archive')
const {ensureAuthenticated,} = require('../config/auth')

//create patient page
router.get('/add', ensureAuthenticated, (req, res) => res.render('pages/patient/patient-add',{title:"Add Patient"}))

//add patient to db
router.post('/add', ensureAuthenticated, async (req, res) => {
  let patient = {
    firstName: req.body.firstName,
    middleName: req.body.middleName,
    lastName: req.body.lastName,
    gender: req.body.genderOther || req.body.gender,
    dateOfBirth: req.body.dateOfBirth,
    phoneLandline: req.body.landline,
    phoneMobile: req.body.mobile,
    email: req.body.email,
    addressHouseNumber: req.body.addressHouseNumber,
    addressLineOne: req.body.addressLineOne,
    addressLineTwo: req.body.addressLineTwo,
    addressCity: req.body.addressCity,
    addressPostcode: req.body.addressPostcode,
    NHSNumber: req.body.NHSNumber,
    patientType: req.body.patientType,
    GPName: req.body.GPName,
    GPAddress: req.body.GPAddress,
    notes: req.body.notes,
  }

  try{
    const newPatient = await new Patient(patient)
    newPatient.save()
  } catch{
    res.render("errors/404")
  }

  req.flash('success_msg', 'Patient has been added')
  res.redirect('/patient/list')
})

//list patients
router.get('/list/', ensureAuthenticated, async (req, res) => {

  //number of elements to show per page
  const RESULTS_PER_PAGE = 25
  //cleans search queries
  const query = Object.entries(req.query).reduce((obj,[key,value]) => (value ? (obj[key]=value, obj) : obj), {})

  //limit how many documents skipped for search, (goes up in 50's)
  //default 0 if not specified in url
  const skip = (Number(query.page) || 0) * RESULTS_PER_PAGE
  //sort order. Default sort by last name A-Z, then first name A-Z
  let sort = {"lastName":1,"firstName":1}

  if(query.sort){ 
    let order = 1
    if(query.order == "za") order = -1
    sort = {[query.sort]:[order]} 
  }

  
  try {
    const patients = await Patient.find().sort(sort).skip(skip).limit(RESULTS_PER_PAGE)
    const totalPages = Math.ceil( await Patient.estimatedDocumentCount() / RESULTS_PER_PAGE )
    res.render('pages/patient/patient-list', {
      patients,
      title:"List Patients",
      totalPages
    })
  } catch (error) {
    res.render("errors/500")
  }
})


// view patient
router.get('/view/:patientID', ensureAuthenticated, async (req, res) => {
  const id = req.params.patientID

  try {
    const patient = await Patient.findById(id)
    const exams = await Exam.find({ patientID: id })
    const optoms = await User.find({ })
    if (patient) {
      res.render('pages/patient/patient-view', {
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
    const patient = await Patient.findById(id)
    if (patient) {
      res.render('pages/patient/patient-edit', {
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

  const newInfo = {
    firstName: req.body.firstName,
    middleName: req.body.middleName,
    lastName: req.body.lastName,
    gender: req.body.gender,
    genderOther: req.body.genderOther,
    dateOfBirth: req.body.dateOfBirth,
    phoneLandline: req.body.phoneLandline,
    phoneMobile: req.body.phoneMobile,
    email: req.body.email,
    addressHouseNumber: req.body.addressHouseNumber,
    addressLineOne: req.body.addressLineOne,
    addressLineTwo: req.body.addressLineTwo,
    addressCity: req.body.addressCity,
    addressPostcode: req.body.addressPostcode,
    NHSNumber: req.body.NHSNumber,
    patientType: req.body.patientType,
    GPName: req.body.GPName,
    GPAddress: req.body.GPAddress,
    editReason: req.body.editReason,
    notes: req.body.notes,
  }
  
  try {
    const patient = await Patient.findById(id)

    if (patient) {

      const archivePatient = new Archive({ 
        archiveType: "Patient Edited by User",
        archiveReason: `${req.body.editReason}`,
        archivedBy: req.user._id,
        patientDocument: patient,
      }) 

      let changes = []

      for (const [key, value] of Object.entries(newInfo)) {
        if(patient[key] != value && key != "editReason" && key != "genderOther"){
          patient[key] = value
          changes.push(key)
        }
      }

      console.log(changes)

      if(changes.includes("gender")){
        if(patient.gender == newInfo.genderOther){
          changes.splice(changes.indexOf("gender"), 1)
          changes.splice(changes.indexOf("genderOther"), 1)
        }
      }

      // changes.splice(changes.indexOf("editReason"), 1)

      //turn into list, capitalise first letter
      
      if(changes.length > 0){
        changes = changes.join(", ")
        changes = changes.replace( /([A-Z])/g, " $1" )
        changes = changes.charAt(0).toUpperCase() + changes.slice(1)
        patient.save()
        archivePatient.fieldsChanged = changes
        archivePatient.save()
      }

      res.redirect(`/patient/view/${id}`)

      return
    }
    throw ("not found")
  } catch (error) {
    console.log(error)
    res.redirect(`/errors/500`)
    return
  }
})

// search patient page
router.get("/search/", ensureAuthenticated, async (req, res) => {

  // mess removes empty params as obtained from URL e.g /patient/search?firstName=oliver&lastName=&dateOfBirth= -> { firstName: 'oliver' }
  const query = Object.entries(req.query).reduce((obj,[key,value]) => (value ? (obj[key]=value, obj) : obj), {})
  let patients = []
  if(Object.keys(query).length !== 0){
    patients = await Patient.find(query).collation({locale: 'en', strength: 1}).sort({"lastName": 1, "firstName": 1}).limit(30)
  }

  res.render("pages/patient/patient-search", {
    last: query,
    patients,
    title:`Search Patients`,
  })
 
})


module.exports = router