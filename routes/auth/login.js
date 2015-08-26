module.exports = function(config, req, res) {
  if (req.query.anonymousId) {
    req.session.project = {
      anonymousId: req.query.anonymousId,
      migrate: true
    };
  } else {
    req.session.home = true;
  }

  var loginType = "&action=" + (req.query.signup ?  "signup" : "signin");
  var state = "&state=" + req.cookies.state;

  res.redirect(301, config.loginURL + state + loginType);
};
