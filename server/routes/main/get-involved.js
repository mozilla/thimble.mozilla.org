var querystring = require("querystring");
var moment = require("moment");

module.exports = function(config, req, res) {
  var locale =
    req.localeInfo && req.localeInfo.lang ? req.localeInfo.lang : "en-US";
  var qs = querystring.stringify(req.query);
  if (qs !== "") {
    qs = "?" + qs;
  }

  // make sure the glitch move date is localized:
  moment.locale("en");
  var migrationDate = moment(config.glitch.migrationDate);
  migrationDate = migrationDate.locale(locale).format("LL");

  var options = {
    loginURL: config.appURL + "/" + locale + "/login",
    editorHOST: config.editorHOST,
    editorURL: config.editorURL,
    URL_PATHNAME: "/get-involved/" + qs,
    languages: req.app.locals.languages,
    pageName: "get-involved",
    glitchExportEnabled: req.user && config.glitch.exportEnabled,
    migrationDate: migrationDate,
    moreInfoURL: config.glitch.moreInfoURL,
    shutdownNewAccounts: config.shutdownNewAccounts,
    shutdownNewProjectsAndPublishing: config.shutdownNewProjectsAndPublishing
  };

  if (req.user) {
    options.username = req.user.username;
    options.avatar = req.user.avatar;
    options.logoutURL = config.logoutURL;
  }

  res.render("homepage/get-involved.html", options);
};
