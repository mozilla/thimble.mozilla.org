module.exports = function(config, req, res) {
  req.session.project = {
    anonymousId: req.query.anonymousId,
    migrate: {
      meta: {
        title: req.query.title,
        date_created: req.query.now,
        date_updated: req.query.now
      }
    }
  };

  var loginType = "&action=" + (req.query.signup ?  "signup" : "signin");
  var state = "&state=" + req.cookies.state;

  res.redirect(301, config.loginURL + state + loginType);
};
