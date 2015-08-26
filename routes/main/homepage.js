var querystring = require("querystring");

var env = require("../../lib/environment");

module.exports = function(config, req, res) {
  var qs = querystring.stringify(req.query);
  if(qs !== "") {
    qs = "?" + qs;
  }

  var options = {
    keepCalmRemixUrl: env.get("KEEP_CALM_REMIX_URL"),
    keepCalmPublishedUrl: env.get("KEEP_CALM_PUBLISHED_URL"),
    backToSchoolRemixUrl: env.get("BACK_TO_SCHOOL_REMIX_URL"),
    backToSchoolPublishedUrl: env.get("BACK_TO_SCHOOL_PUBLISHED_URL"),
    comicStripRemixUrl: env.get("COMIC_STRIP_REMIX_URL"),
    comicStripPublishedUrl: env.get("COMIC_STRIP_PUBLISHED_URL"),
    loginURL: config.appURL + "/login",
    editorHOST: config.editorHOST,
    editorURL: config.editorURL
  };

  if (req.user) {
    options.username = req.user.username;
    options.avatar = req.user.avatar;
    options.logoutURL = config.logoutURL;
  }

  res.render("homepage/index.html", options);
};
