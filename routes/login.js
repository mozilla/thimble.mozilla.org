module.exports = function(config) {
  return function(req, res) {
    req.session.project = {
      anonymousId: req.query.anonymousId,
      meta: {
        date_created: req.query.now,
        date_updated: req.query.now
      }
    };

    var loginType = "&action=" + (req.query.signup ?  "signup" : "signin");
    var state = "&state=" + req.cookies.state;

    res.redirect(301, config.loginURL + state + loginType);
  };
};
