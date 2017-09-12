var querystring = require("querystring");

module.exports = function(config, req, res) {
  var locale =
    req.localeInfo && req.localeInfo.lang ? req.localeInfo.lang : "en-US";
  var qs = querystring.stringify(req.query);
  if (qs !== "") {
    qs = "?" + qs;
  }

  var options = {
    loginURL: config.appURL + "/" + locale + "/login",
    editorHOST: config.editorHOST,
    editorURL: config.editorURL,
    URL_PATHNAME: "/" + qs,
    languages: req.app.locals.languages,
    pageName: "get-involved"
  };

  if (req.user) {
    options.username = req.user.username;
    options.avatar = req.user.avatar;
    options.logoutURL = config.logoutURL;
  }

  res.render("homepage/get-involved.html", options);
};
