const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
// Load User model
const User = require("../models/User");
const { forwardAuthenticated } = require("../config/auth");

// Login Page
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

// Register Page
router.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register")
);

// Register
router.post("/register", (req, res) => {
  const name = req.body.name;
  const username = req.body.username;
  const optometrist = req.body.hasOwnProperty("optometrist");
  const password = req.body.password;
  const password2 = req.body.password2;

  //const { name, username, optometrist, password, password2 } = req.body;
  let errors = [];

  //check all fields are filled. Might switch to client side
  if (!name || !username || !password || !password2) {
    errors.push({ msg: "Please fill out all fields", });
  }

  //check passwords match
  if (password != password2) {
    errors.push({ msg: "Passwords do not match", });
  }

  //check password is at least 4 chars, (yes it's weak)
  if (password.length < 4) {
    errors.push({ msg: "Password must be at least 4 characters", });
  }

  //display errors if there are any
  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      username,
      password,
      password2,
    });
    return;
  }

  //Look in the db for the username
  User.findOne({ username: username }).then((user) => {
    if (user) {
      errors.push({ msg: "Username already in use" });
      res.render("register", {
        errors,
        name,
        username,
        password,
        password2,
      });
      //if user if found, return.
      return;
    }

    //create instance of user schema
    const newUser = new User({
      name,
      optometrist,
      username,
      password,
    });

    //hash and salt password, and push whole thing to the database
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then((user) => {
            req.flash("success_msg", "User is now registered");
            res.redirect("/users/register");
          })
          .catch((err) => console.log(err));
      });
    });
  });
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
