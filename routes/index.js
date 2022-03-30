const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

router.get('/', forwardAuthenticated, (_req, res) => res.render('login', { layout: false }));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => res.render('dashboard', { user: req.user, }));


// Login Page
router.get('/login', forwardAuthenticated, (_req, res) => res.render('login', { layout: false }));

// Register Page
router.get('/add-staff', ensureAuthenticated, (_req, res) => res.render('staff-add'));


// add-staff
router.post('/add-staff', (req, res) => {
  const { name, username, password, password2 } = req.body;
  const optometrist = 'optometrist' in req.body;
  
  const errors = [];
  
  // check all fields are filled. Might switch to client side
  if (!name || !username || !password || !password2) {
    errors.push({ msg: 'Please fill out all fields' });
  }

  // check passwords match
  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  
  // check password is at least 4 chars, (yes it's weak)
  if (password.length < 4) {
    errors.push({ msg: 'Password must be at least 4 characters' });
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
  User.findOne({ username }).then((user) => {
    if (user) {
      errors.push({ msg: 'Username already in use' });
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
  const{
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
    if(gender==="other"){
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
  try{
    const patients = await Patient.find().lean();
    res.render('patients-list',{patients});
  } catch (error){
    res.render("errors/500");
  }
});

router.get('/list-staff', ensureAuthenticated, async (req, res) => {
  try{
    const users = await User.find().lean();
    res.render('staff-list',{users});
  } catch (error){
    res.render("errors/500");
  }
});

router.get('/view-patient/:patientID', ensureAuthenticated, async (req, res) => {
  const id = req.params.patientID
  if(!id){
    res.render('errors/404');
    return
  }
  try {
    const patients = await Patient.find({_id:id})
    const patient = patients[0]
    if(patient){
      res.render('patient-view',{patient})
      return
    }
    throw("not found")
  } catch (error) {
    res.render('errors/404')
    return
  }
});

router.get('/add-exam', ensureAuthenticated, (req, res) => res.render('exam-add'))

router.post('/add-exam', ensureAuthenticated, (req, res) => {
  console.log(req.body)
  res.render('exam-add')
});



module.exports = router;
