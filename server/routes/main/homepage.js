var moment = require("moment");
var querystring = require("querystring");

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
    glitchExportEnabled: req.user && config.glitch.exportEnabled,
    showGlitchDialog: true,
    migrationDate: migrationDate,
    moreInfoURL: config.glitch.moreInfoURL,
    URL_PATHNAME: "/" + qs,
    languages: req.app.locals.languages,
    pageName: "home",
    shutdownNewAccounts: config.shutdownNewAccounts,
    shutdownNewProjectsAndPublishing: config.shutdownNewProjectsAndPublishing
  };

  if (req.user) {
    options.username = req.user.username;
    options.avatar = req.user.avatar;
    options.logoutURL = config.logoutURL;
  }

  res.render("homepage/index.html", options);
};
