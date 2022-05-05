const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Patient = require("../models/Patient")
const Exam = require("../models/Exam")
const {ensureAuthenticated,} = require("../config/auth")
const stream = require("stream")


//View an exam
router.get("/view/:examID", ensureAuthenticated, async (req, res) => {
  const id = req.params.examID
  try {
    const exam = await Exam.findById(id)
    const optometrists = await User.find()
    if (exam) {
      res.render("pages/exam/exam-view", {
        exam,
        optometrists,
        title:"View Exam"
      })
      return
    }
    throw ("not found")
  } catch (error) {
    res.render("errors/404")
    return
  }
})

//Page to add exam to patient specified in URL
router.get("/add/:patientID", ensureAuthenticated, async (req, res) => {
  const id = req.params.patientID
  try {
    const patient = await Patient.findById(id)
    const optometrists = await User.find({ optometrist: true })
    const lastExam = await Exam.findOne({patientID:id}).sort({"dateOfVisit": -1, "dateAdded":-1}).limit(1)
    if (patient) {
      res.render("pages/exam/exam-add", {
        user: req.user,
        patientID: id,
        optometrists,
        lastExam,
        title:"New Exam"
      })
      return
    }
    throw ("not found")
  } catch (error) {
    res.render("errors/404")
  }
})

//Add exam
router.post("/add/:patientID", ensureAuthenticated, async (req, res) => {

  //most fileds can be directly taken, those that are missing have a comment line
  let exam = {
    patientID: req.body.patientID,
    visitReason: req.body.visitReason,
    familyHistory: req.body.familyHistory,
    generalHealth: req.body.generalHealth,
    medication: req.body.medication,
    patientDrives: Boolean(req.body.patientDrives) || false,
    patientUsesVDU: Boolean(req.body.patientUsesVDU) || false,
    occupation: req.body.occupation,
    ocularHistory: req.body.ocularHistory,
    dateOfVisit: req.body.dateOfVisit,
    performingOptometrist: req.body.performingOptometrist,
    author: req.body.author,
    //date added auto
    lensOpacityLeft: req.body.lensOpacityLeft,
    lensOpacityRight: req.body.lensOpacityRight,
    lensComment: req.body.lensComment,
    vitreousLeft: req.body.vitreousLeft,
    vitreousRight: req.body.vitreousRight,
    viterousComment: req.body.viterousComment,
    discLeft: req.body.discLeft,
    discRight: req.body.discRight,
    discComment: req.body.discComment,
    fundusLeft: req.body.fundusLeft || req.body.fundusLeftOther,
    fundusRight: req.body.fundusRight || req.body.fundusRightOther,
    maculaLeft: req.body.maculaLeft || req.body.maculaLeftOther,
    maculaRight: req.body.maculaRight || req.body.maculaRightOther,
    pupils: req.body.pupils,
    pupilsComment: req.body.pupilsComment,
    IOPLeft: req.body.IOPLeft,
    IOPRight: req.body.IOPRight,
    IOPComment: req.body.IOPComment,
    visualFieldLeft: req.body.visualFieldLeft,
    visualFieldRight: req.body.visualFieldRight,
    visualFieldComment: req.body.visualFieldComment,
    fixationDisparity: req.body.fixationDisparity,
    motility: req.body.motility || req.body.motilityOther,
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
    adviceGiven: req.body.adviceGiven
  }

  if (req.body.adviceSpecifics) exam.adviceGiven = `${req.body.adviceGiven} - ${req.body.adviceSpecifics}`

  if (req.body.visualAcuityMod == 0) {
    exam.visualAcuity = req.body.visualAcuity
  } else exam.visualAcuity = `${req.body.visualAcuity} ${req.body.visualAcuityMod}`

  if (Array.isArray(req.body.prismLeft)) {
    exam.prismBaseLeft = req.body.prismLeft.join(", ")
  } else exam.prismBaseLeft = req.body.prismLeft

  if (Array.isArray(req.body.prismRight)) {
    exam.prismBaseRight = req.body.prismRight.join(", ")
  } else exam.prismBaseRight = req.body.prismRight

  if (req.body.sphereLeft != "plano") {
    exam.sphereLeft = `${req.body.sphereLeftSign}${req.body.sphereLeft}`
  } else exam.sphereLeft = req.body.sphereLeft

  if (req.body.sphereRight != "plano") {
    exam.sphereRight = `${req.body.sphereRightSign}${req.body.sphereRight}`
  } else exam.sphereRight = req.body.sphereRight

  if(req.files){
    let files = []
    files.push(req.files.attachments)
    exam.attachments = files.flat()
  }
    
  try {
    const newExam = new Exam(exam)
    const patient = await Patient.findOne({_id: req.body.patientID})
    newExam.save()
    patient.exams.push(newExam._id)
    patient.save()
  } catch (error) {
    res.render(`errors/500`)
    return
  }

  res.redirect(`/patient/view/${req.body.patientID}`)
})


//download a file then close the tab
router.get("/download/:examID/:fileIndex", ensureAuthenticated, async (req, res) => {
  const id = req.params.examID
  const index = req.params.fileIndex

  try {
    //get the exam
    const exam = await Exam.findById(id)
    //get the file from the exam as specified by index
    const attachment = exam.attachments[index]
    //convert to a buffer
    let fileContents = Buffer.from(attachment.data.buffer, "binary")
    //stream from the buffer
    let readStream = new stream.PassThrough()
    //close the stream
    readStream.end(fileContents)
    //set resonse headers
    res.set("Content-disposition", "attachment; filename=" + attachment.name)
    res.set("Content-Type", attachment.minetype)
    //send the response
    readStream.pipe(res)
  
  } catch (error) {
    res.send("<script>window.close()</script > ") //close tab by sending script
  }
})


module.exports = router