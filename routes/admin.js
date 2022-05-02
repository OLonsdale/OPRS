const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Patient = require('../models/Patient')
const Exam = require('../models/Exam')
const Archive = require('../models/Archive')
const Audit = require('../models/Audit')
const {
  ensureAuthenticated,
} = require('../config/auth')


// Admin Dashboard
router.get('/', ensureAuthenticated, (_req, res) => res.render('pages/admin/admin'))

//Archive System

// Archive list
router.get('/archive/list', ensureAuthenticated, async (req, res) => {
  try {
    const RESULTS_PER_PAGE = 25
    //clean queries from URL
    const query = Object.entries(req.query).reduce((obj, [key, value]) => (value ? (obj[key] = value, obj) : obj), {})
    //results to skip to equate to page numbers, default 0 for page 1
    const skip = (Number(query.page) || 0) * RESULTS_PER_PAGE
    //number of pages total, round up for less than RESULTS_PER_PAGE number of results
    const documentCount = await Archive.estimatedDocumentCount()
    // const totalPages = (documentCount < RESULTS_PER_PAGE) ? 1 :  Math.ceil( documentCount / RESULTS_PER_PAGE )
    const totalPages = Math.ceil(documentCount / RESULTS_PER_PAGE)

    //get results
    const archive = await Archive.find().skip(skip).limit(RESULTS_PER_PAGE)
    //get optometrists
    const optoms = await User.find()

    res.render('pages/admin/archive-list', {
      elements: archive,
      title: "Archive",
      optoms,
      totalPages
    })
  } catch (error) {
    res.render("errors/500")
  }
})

//View archived document
router.get('/archive/view/:archiveID', ensureAuthenticated, async (req, res) => {
  const _id = req.params.archiveID

  try {
    //get document by id, and all users
    const element = await Archive.findById(_id)
    const optoms = await User.find({})
    if (element) {
      res.render('pages/admin/archive-view', {
        element,
        optoms,
        title: `Archived Document`
      })
      return
    }
    throw ("not found")
  } catch (error) {
    res.render('errors/404')
    return
  }
})

//Page to add document to archive. Works on patients and exams.
router.get('/archive/add/:type/:id', ensureAuthenticated, async (req, res) => {
  const _id = req.params.id
  const type = req.params.type
  let element

  if (type == "patient") {
    try {
      element = await Patient.findById(_id)
    } catch (err) {
      res.render("errors/500")
    }
  } else if (type == "exam") {
    try {
      element = await Exam.findById(_id)
    } catch (err) {
      res.render("errors/500")
    }
  }

  try {
    const optoms = await User.find({})
    if (element) {
      res.render('pages/admin/archive-add', {
        element,
        optoms,
        type,
        title: `Archive ${type}`

      })
      return
    }
    throw ("not found")
  } catch (error) {
    res.render('errors/404')
    return
  }
})

//Add document to archive
router.post('/archive/add/:type/:id', ensureAuthenticated, async (req, res) => {
  const _id = req.params.id
  const type = req.params.type
  const archiveReason = req.body.archiveReason

  //get document
  if (type == "patient") {
    try {
      const patient = await Patient.findById(_id)
      const archivePatient = new Archive({
        archiveType: "Patient Archived by User",
        archiveReason: `${archiveReason}`,
        archivedBy: req.user._id,
        patientDocument: patient,
      })

      //can't await in .foreach loop
      for (const examID of patient.exams) {
        const exam = await Exam.findOne({
          _id: examID
        })
        archivePatient.exams.push(exam)
        exam.remove()
      }
      patient.remove()

      archivePatient.save()


    } catch (err) {
      res.render("errors/500")
    }
  } else if (type == "exam") {
    try {
      const exam = await Exam.findById(_id)
      const archiveExam = new Archive({
        archiveType: "Exam Archived by User",
        archiveReason: `${archiveReason}`,
        archivedBy: req.user._id,
        examDocument: exam,
      })
      archiveExam.save()
      exam.remove()
    } catch (err) {
      res.render("errors/500")
    }
  }

  //archive document and if document is patient archive exams for patient

  res.redirect("/admin/archive/list")
})

//logs

router.get('/audit/list', ensureAuthenticated, async (req, res) => {
  try {
    //See "Archive list get request route" for line-by-line breakdown.
    const RESULTS_PER_PAGE = 25

    const query = Object.entries(req.query).reduce((obj, [key, value]) => (value ? (obj[key] = value, obj) : obj), {})

    const skip = (Number(query.page) || 0) * RESULTS_PER_PAGE

    let filter = {}

    if (query.filterByUser) {
      filter.user = query.filterByUser
    }
    if (query.filterDateFrom && query.filterDateTo) {
      filter.timestamp = {
        $gte: query.filterDateFrom,
        $lte: query.filterDateTo
      }
    } else if (query.filterDateFrom) {
      filter.timestamp = {
        $gte: query.filterDateFrom
      }
    } else if (query.filterDateTo) {
      filter.timestamp = {
        $lte: query.filterDateTo
      }
    }

    const audit = await Audit.find(filter).sort({
      timestamp: -1
    }).skip(skip).limit(RESULTS_PER_PAGE)
    const totalPages = Math.ceil(audit.length / RESULTS_PER_PAGE)

    const optoms = await User.find()
    res.render('pages/admin/audit-list', {
      elements: audit,
      title: "Audit Logs",
      optoms,
      totalPages,
      lastQuery: query
    })
  } catch (error) {
    console.log(error)
    res.render("errors/500")
  }
})



module.exports = router