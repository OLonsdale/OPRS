const Audit = require("../models/Audit")

module.exports = {
  //only allows access for authenticated users
  ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      const auditEvent = new Audit({
        event:`Page Accessed: ${req.originalUrl}`,
        user:req.user._id,
        IP:req.ip
      })
      auditEvent.save()
      return next();
    }
    req.flash("error_msg", "Please log in to view that resource");
    res.redirect("/login");
  },
  //only allows to login for non-authenticated users
  forwardAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/dashboard");
  },
};
