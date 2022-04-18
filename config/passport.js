const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')

// Load User model
const User = require('../models/User')

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
      // Match user
      User.findOne({ username: username })
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'That username is not registered' })
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            console.log(`Match: ${password} | ${user.password}`)
            return done(null, user)
          } else {
            console.log(`No match: ${password} | ${user.password}`)
            return done(null, false, { message: 'Password incorrect' })
          }
        })
      })
    })
  )

  //used to store session in cookie to persist more effectivly
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  })

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    })
  })
}
