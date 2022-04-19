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
    const patient = await Patient.findOne({ _id: id })
    const optometrists = await User.find({ optometrist: true })
    const author = req.user
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

  try {
    //save exam and add ID to patient exams list
    const newExam = new Exam(req.body)
    const patient = await Patient.findOne({_id: req.body.patientID})
    newExam.save()
    patient.exams.push(newExam._id)
    patient.save()
  } catch (error) {
    res.render(`errors/500`)
  }
  
})


module.exports = router