module.exports = {
  //only allows access for authenticated users
  ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      console.log("\nValid request recieved\n")
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    console.log("\nInvalid request recieved\n")
    res.redirect('/login');
  },
  //only allows to login for non-authenticated users
  forwardAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    console.log("\nyou're already logged in, go here:\n")
    res.redirect('/dashboard');
  },
};
