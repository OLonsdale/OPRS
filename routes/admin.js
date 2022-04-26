const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Patient = require('../models/Patient')
const Exam = require('../models/Exam')
const Archive = require('../models/Archive')
const {ensureAuthenticated,} = require('../config/auth')


// Admin Dash
router.get('/', ensureAuthenticated, (_req, res) => res.render('admin', {
  title:"Admin System"
}))

//archive

router.get('/archive/list', ensureAuthenticated, async (req, res) => {
  try {
    const archive = await Archive.find().lean()
    const optoms = await User.find().lean()
    res.render('archive-list', {
      elements: archive,
      title:"Archive",
      optoms
    })
  } catch (error) {
    res.render("errors/500")
  }
})

router.get('/archive/view/:archiveID', ensureAuthenticated, async (req, res) => {
  const _id = req.params.archiveID

  try {
    const element = await Archive.findOne({ _id })
    const optoms = await User.find({ })
    if (element) {
      res.render('archive-view', {
        element,
        optoms,
        title:`Archived Document`
      })
      return
    }
    throw ("not found")
  } catch (error) {
    res.render('errors/404')
    return
  }
})

router.get('/archive/add/:type/:id', ensureAuthenticated, async (req, res) => {
  const _id = req.params.id
  const type = req.params.type
  let element

  if(type == "patient"){
    try{
      element = await Patient.findOne({ _id })
    } catch (err){
      res.render("errors/500")
    }
  } else if (type == "exam") {
    try{
      element = await Exam.findOne({ _id })
    } catch (err){
      res.render("errors/500")
    }
  }

  try {
    const optoms = await User.find({ })
    if (element) {
      res.render('archive-add', {
        element,
        optoms,
        type,
        title:`Archive ${type}`
        
      })
      return
    }
    throw ("not found")
  } catch (error) {
    res.render('errors/404')
    return
  }
})


//get archive add page
router.get('/archive/add/:type/:id', ensureAuthenticated, async (req, res) => {
  const _id = req.params.id
  const type = req.params.type
  let element

  if(type == "patient"){
    try{
      element = await Patient.findOne({ _id })
    } catch (err){
      res.render("errors/500")
    }
  } else if (type == "exam") {
    try{
      element = await Exam.findOne({ _id })
    } catch (err){
      res.render("errors/500")
    }
  }

  try {
    const optoms = await User.find({ })
    if (element) {
      res.render('archive-add', {
        element,
        optoms,
        type,
        title:`Archive ${type}`
        
      })
      return
    }
    throw ("not found")
  } catch (error) {
    res.render('errors/404')
    return
  }
})

//archive document with post
router.post('/archive/add/:type/:id', ensureAuthenticated, async (req, res) => {
  const _id = req.params.id
  const type = req.params.type
  const archiveReason = req.body.archiveReason

  //get document
  if(type == "patient"){
    try{
      const patient = await Patient.findOne({ _id })
      const archivePatient = new Archive({ 
        archiveType: "Patient",
        archiveReason: `${archiveReason}`,
        archivedBy: req.user._id,
        patientDocument: patient,
      })
      
      //can't await in .foreach loop
      for(const examID of patient.exams){
        const exam = await Exam.findOne({_id:examID})
        archivePatient.exams.push(exam)
        exam.remove()
      }
      patient.remove()
      
      archivePatient.save()


    } catch (err){ res.render("errors/500") }
  } else if (type == "exam") {
    try{
      const exam = await Exam.findOne({ _id })
      const archiveExam = new Archive({
        archiveType: "Exam",
        archiveReason: `${archiveReason}`,
        archivedBy: req.user._id,
        examDocument: exam,
      })
      archiveExam.save()
      exam.remove()
    } catch (err){
      res.render("errors/500")
    }
  }

  //archive document and if document is patient archive exams for patient

  res.redirect("/admin/archive/list")
})

//logs





module.exports = router