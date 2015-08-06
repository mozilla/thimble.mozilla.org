module.exports = function(config) {
  return function(req, res) {
    var loginType = "&action=" + (req.query.signup ?  "signup" : "signin");
    var state = "&state=" + req.cookies.state;

    res.redirect(301, config.loginURL + state + loginType);
  };
};
