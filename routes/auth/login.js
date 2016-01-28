module.exports = function(config, req, res) {
  if (req.query.anonymousId) {
    req.session.project = {
      anonymousId: req.query.anonymousId,
      migrate: true
    };
  } else {
    req.session.home = true;
  }
console.log("Pre: ", req.localeInfo);
  req.session.locale = req.localeInfo && req.localeInfo.lang || "en-US";
console.log("the locale is: ", req.session.locale);
  var loginType = "&action=" + (req.query.signup ?  "signup" : "signin");
  var state = "&state=" + req.cookies.state;

  res.set({
    "Cache-Control": "no-cache"
  });

  res.redirect(307, config.loginURL + state + loginType);
};
