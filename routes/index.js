const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

router.get('/', forwardAuthenticated, (_req, res) => res.render('login'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => res.render('dashboard', { user: req.user, }));

//create patient
router.get('/create-patient', ensureAuthenticated, (req, res) => res.render('create-patient'));

// Login Page
router.get('/login', forwardAuthenticated, (_req, res) => res.render('login'));

// Register Page
router.get('/register', ensureAuthenticated, (_req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, username, password, password2 } = req.body;
  const optometrist = 'optometrist' in req.body;

  // const { name, username, optometrist, password, password2 } = req.body;
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
    res.render('register', {
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
      res.render('register', {
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
            res.redirect('/register');
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

module.exports = router;
