/* eslint-disable no-unused-vars */
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Patient = require('../models/Patient');
const Exam = require('../models/Exam');
const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../config/auth');

router.get('/view/:examID', ensureAuthenticated, async (req, res) => {
  const id = req.params.examID
  if (!id) {
    res.render('errors/404');
    return
  }
  try {
    const exam = await Exam.findOne({
      _id: id
    })
    const optoms = await User.find()
    if (exam) {
      res.render('exam-view', {
        exam,
        optoms
      })
      return
    }
    throw ("not found")
  } catch (error) {
    res.render('errors/404')
    return
  }
});

router.get('/view', ensureAuthenticated, (req, res) => {
  res.render('errors/404');
});

router.get('/add/:patientID', ensureAuthenticated, async (req, res) => {
  const id = req.params.patientID
  try {
    const patient = await Patient.findOne({
      _id: id
    })
    const optometrists = await User.find({
      optometrist: true
    })
    if (patient) {
      res.render('exam-add', {
        user: req.user,
        patientID: id,
        optometrists
      })
      return
    }
    throw ("not found")
  } catch (error) {
    res.render('errors/404')
  }
})

router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('errors/404');
})

router.post('/add', ensureAuthenticated, async (req, res) => {
  console.log("request body: \n", req.body, "\n\n")

  let exam = {
    patientID: req.body.patientID,
    visitReason: req.body.visitReason,
    familyHistory: req.body.familyHistory,
    generalHealth: req.body.generalHealth,
    medication: req.body.medication,
    //drives
    //vdu
    occupation: req.body.occupation,
    ocularHistory: req.body.ocularHistory,
    dateOfVisit: req.body.visitDate,
    performingOptometrist: req.body.optometrist,
    author: req.body.author,
    //date added auto
    lensOpacityLeft: req.body.lensOpacityLeft,
    lensOpacityRight: req.body.lensOpacityRight,
    lensComment: req.body.lensComment,
    vitreousLeft: req.body.vitreousLeft,
    vitreousRight: req.body.vitreousRight,
    viterousComment: req.body.viterousComment,
    diskLeft: req.body.diskLeft,
    discRight: req.body.discRight,
    discComment: req.body.discComment,
    //fundus and macula l & r
    pupils: req.body.pupils,
    pupilsComment: req.body.pupilsComment,
    IOPLeft: req.body.IOPLeft,
    IOPRight: req.body.IOPRight,
    IOPComment: req.body.IOPComment,
    visualFieldLeft: req.body.visualFieldLeft,
    visualFieldRight: req.body.visualFieldRight,
    visualFieldComment: req.body.visualFieldComment,
    //fixation disp
    //motility
    convergence: req.body.convergence,
    stereopsis: req.body.stereopsis,
    //va
    //sphere
    cylinderLeft: req.body.cylinderLeft,
    cylinderRight: req.body.cylinderRight,
    axisLeft: req.body.axisLeft,
    axisRight: req.body.axisRight,
    //prism
    recallCode: req.body.recallCode,
  }
  exam.adviceGiven = `${req.body.adviceGiven}`
  if (req.body.adviceSpecifics) exam.adviceGiven = `${req.body.adviceGiven} - ${req.body.adviceSpecifics}`

  if (req.body.patientDrives) {
    exam.patientDrives = true
  } else exam.patientDrives = false

  if (req.body.patientUsesVDU) {
    exam.patientUsesVDU = true
  } else exam.patientUsesVDU = false

  if (req.body.fundusLeft == "other") {
    exam.fundusLeft = req.body.fundusLeftOther
  } else exam.fundusLeft = req.body.fundusLeft

  if (req.body.fundusRight == "other") {
    exam.fundusRight = req.body.fundusRightOther
  } else exam.fundusRight = req.body.fundusRight

  if (req.body.maculaLeft == "other") {
    exam.maculaLeft = req.body.maculaLeftOther
  } else exam.maculaLeft = req.body.maculaLeft

  if (req.body.maculaRight == "other") {
    exam.maculaRight = req.body.maculaRightOther
  } else exam.maculaRight = req.body.maculaRight

  if (req.body.motility == "other") {
    exam.motility = req.body.motilityOther
  } else exam.motility = req.body.motility

  if (req.body.visualAcuityMod == 0) {
    exam.visualAcuity = req.body.visualAcuity
  } else exam.visualAcuity = `${req.body.visualAcuity} ${req.body.visualAcuityMod}`

  if (Array.isArray(req.body.prismLeft)) {
    exam.prismBaseLeft = req.body.prismLeft.join()
  } else exam.prismBaseLeft = req.body.prismLeft

  if (Array.isArray(req.body.prismRight)) {
    exam.prismBaseRight = req.body.prismRight.join()
  } else exam.prismBaseRight = req.body.prismRight

  if (req.body.sphereLeft != "plano") {
    exam.sphereLeft = `${req.body.sphereLeftSign}${req.body.sphereLeft}`
  } else exam.sphereLeft = `${req.body.sphereLeft}`

  if (req.body.sphereRight != "plano") {
    exam.sphereRight = `${req.body.sphereRightSign}${req.body.sphereRight}`
  } else exam.sphereRight = `${req.body.sphereRight}`


  const newExam = new Exam(exam)

  newExam.save()

  console.log("Saved exam: \n", newExam, "\n\n")

  res.redirect(`/patient/view/${req.body.patientID}`)
});


module.exports = router;