module.exports = function(config, req, res) {
  req.session.project = {
    anonymousId: req.query.anonymousId,
    migrate: true
  };

  var loginType = "&action=" + (req.query.signup ?  "signup" : "signin");
  var state = "&state=" + req.cookies.state;

  res.redirect(301, config.loginURL + state + loginType);
};
