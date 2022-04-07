const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Exam = require('../models/Exam');
const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../config/auth');

router.get('/', forwardAuthenticated, (_req, res) => res.render('login', {
  layout: false
}));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => res.render('dashboard', {
  user: req.user,
}));


// Login Page
router.get('/login', forwardAuthenticated, (_req, res) => res.render('login', {
  layout: false
}));

// Register Page
router.get('/add-staff', ensureAuthenticated, (_req, res) => res.render('staff-add'));


// add-staff
router.post('/add-staff', (req, res) => {
  const {
    name,
    username,
    password,
    password2
  } = req.body;
  const optometrist = 'optometrist' in req.body;

  const errors = [];

  // check all fields are filled. Might switch to client side
  if (!name || !username || !password || !password2) {
    errors.push({
      msg: 'Please fill out all fields'
    });
  }

  // check passwords match
  if (password != password2) {
    errors.push({
      msg: 'Passwords do not match'
    });
  }

  // check password is at least 4 chars, (yes it's weak)
  if (password.length < 4) {
    errors.push({
      msg: 'Password must be at least 4 characters'
    });
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
    });
    return;
  }

  // Look in the db for the username
  User.findOne({
    username
  }).then((user) => {
    if (user) {
      errors.push({
        msg: 'Username already in use'
      });
      res.render('staff-add', {
        errors,
        name,
        username,
        password,
        password2,
      });
      // if user if found, return.
      return;
    }

    // create instance of user schema
    const newUser = new User({
      name,
      optometrist,
      username,
      password,
    });

    // hash and salt password, and push whole thing to the database
    bcrypt.genSalt(10, (_err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        // replaces clear password with hashed
        newUser.password = hash;
        // saves to db
        newUser.save()
          // then passes message and reloads page
          .then(() => {
            req.flash('success_msg', 'User is now registered');
            res.redirect('/add-staff');
          })
          .catch((err) => console.log(err));
      });
    });
  });
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});

//create patient
router.get('/add-patient', ensureAuthenticated, (req, res) => res.render('patient-add'));

//add patient
router.post('/add-patient', (req, res) => {
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
  } = req.body;

  let actualGender;
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
  });

  newPatient.save();

  req.flash('success_msg', 'Patient has been added');
  res.redirect('/add-patient');
});

router.get('/list-patients', ensureAuthenticated, async (req, res) => {
  try {
    const patients = await Patient.find().lean();
    res.render('patients-list', {
      patients
    });
  } catch (error) {
    res.render("errors/500");
  }
});

router.get('/list-staff', ensureAuthenticated, async (req, res) => {
  try {
    const users = await User.find().lean();
    res.render('staff-list', {
      users
    });
  } catch (error) {
    res.render("errors/500");
  }
});

router.get('/view-patient/:patientID', ensureAuthenticated, async (req, res) => {
  const id = req.params.patientID
  if (!id) {
    res.render('errors/404');
    return
  }
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
});

router.get('/view-patient', ensureAuthenticated, async (req, res) => {
  res.render('errors/404');
});

router.get('/add-exam/:patientID', ensureAuthenticated, async (req, res) => {
  const id = req.params.patientID
  try {
    const patient = await Patient.findOne({ _id: id })
    const optometrists = await User.find({ optometrist: true })
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

router.get('/add-exam', ensureAuthenticated, (req, res) => {res.render('errors/404');})

router.post('/add-exam', ensureAuthenticated, async (req, res) => {
  console.log(req.body)

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
    sphereLeft: `${req.body.sphereLeftSign}${req.body.sphereLeft}`,
    sphereRight: `${req.body.sphereRighttSign}${req.body.sphereRightt}`,
    cylinderLeft: req.body.cylinderLeft,
    cylinderRight: req.body.cylinderRight,
    axisLeft: req.body.axisLeft,
    axisRight: req.body.axisRight,
    prismLeft: req.body.prismLeft,
    prismRight: req.body.prismRight,
    adviceGiven: `${req.body.adviceGiven} - ${req.body.adviceSpecifics}`,
    recallCode: req.body.recallCode,
  }

  if(req.body.patientDrives){exam.drives = true}
  if(req.body.patientUsesVDU){exam.vdu = true}

  if(req.body.fundusLeft == "other"){
    exam.fundusLeft = req.body.fundusLeftOther
  } else exam.fundusLeft = req.body.fundusLeft
  
  if(req.body.fundusRight == "other"){
    exam.fundusRight = req.body.fundusRightOther
  } else exam.fundusRight = req.body.fundusRight
  
  if(req.body.maculaLeft == "other"){
    exam.maculaLeft = req.body.maculaLeftOther
  } else exam.maculaLeft = req.body.maculaLeft

  if(req.body.maculaRight == "other"){
    exam.maculaRight = req.body.maculaRightOther
  } else exam.maculaRight = req.body.maculaRight

  if(req.body.motility == "other"){
    exam.motility = req.body.motilityOther
  } else exam.motility = req.body.motility


  if(req.body.visualAcuityMod == 0){
    exam.visualAcuity = `${req.body.visualAcuity} ${req.body.visualAcuityMod}`
  } else exam.visualAcuity = req.body.visualAcuity

  const newExam = new Exam(exam)

  newExam.save()

  res.redirect(`/view-patient/${req.body.patientID}`)
});



module.exports = router;