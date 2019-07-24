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
  var glitch = JSON.parse(JSON.stringify(config.glitch));

  var glitchDates = [
    moment(glitch.migrationDate),
    moment(glitch.roadmapDate1),
    moment(glitch.roadmapDate2),
    moment(glitch.roadmapDate3)
  ].map(date => date.locale(locale).format("LL"));

  glitch.migrationDate = glitchDates[0];
  glitch.roadmapDate1 = glitchDates[1];
  glitch.roadmapDate2 = glitchDates[2];
  glitch.roadmapDate3 = glitchDates[3];
  glitch.roadmapDate4 = glitchDates[3];

  var options = {
    loginURL: config.appURL + "/" + locale + "/login",
    editorHOST: config.editorHOST,
    editorURL: config.editorURL,
    URL_PATHNAME: "/moving-to-glitch/" + qs,
    languages: req.app.locals.languages,
    pageName: "moving-to-glitch",
    glitchExportEnabled: req.user && config.glitch.exportEnabled,
    glitch: glitch,
    migrationDate: glitch.migrationDate,
    moreInfoURL: config.glitch.moreInfoURL,
    shutdownNewAccounts: config.shutdownNewAccounts,
    shutdownNewProjectsAndPublishing: config.shutdownNewProjectsAndPublishing
  };

  if (req.user) {
    options.username = req.user.username;
    options.avatar = req.user.avatar;
    options.logoutURL = config.logoutURL;
  }

  res.render("homepage/moving-to-glitch.html", options);
};
