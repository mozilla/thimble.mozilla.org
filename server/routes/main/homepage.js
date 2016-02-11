var querystring = require("querystring");
var nunjucks = require("nunjucks");

var env = require("../../lib/environment");

function urlLocalizer(locale, remixUrl) {
  return nunjucks.renderString(remixUrl, { locale: locale });
}

module.exports = function(config, req, res) {
  var locale = (req.localeInfo && req.localeInfo.lang) ? req.localeInfo.lang : "en-US";
  var localize = urlLocalizer.bind(null, locale);
  var qs = querystring.stringify(req.query);
  if(qs !== "") {
    qs = "?" + qs;
  }

  var options = {
    keepCalmRemixUrl: localize(env.get("KEEP_CALM_REMIX_URL")),
    keepCalmPublishedUrl: env.get("KEEP_CALM_PUBLISHED_URL"),
    backToSchoolRemixUrl: localize(env.get("BACK_TO_SCHOOL_REMIX_URL")),
    backToSchoolPublishedUrl: env.get("BACK_TO_SCHOOL_PUBLISHED_URL"),
    comicStripRemixUrl:localize( env.get("COMIC_STRIP_REMIX_URL")),
    comicStripPublishedUrl: env.get("COMIC_STRIP_PUBLISHED_URL"),
    threeThingsIHeartRemixUrl: localize(env.get("THREE_THINGS_I_HEART_REMIX_URL")),
    threeThingsIHeartKitUrl: env.get("THREE_THINGS_I_HEART_KIT_URL"),
    homeworkExcuseGeneratorRemixUrl: localize(env.get("HOMEWORK_EXCUSE_GENERATOR_REMIX_URL")),
    homeworkExcuseGeneratorKitUrl: env.get("HOMEWORK_EXCUSE_GENERATOR_KIT_URL"),
    sixWordSummerRemixUrl: localize(env.get("SIX_WORD_SUMMER_REMIX_URL")),
    sixWordSummerKitUrl: env.get("SIX_WORD_SUMMER_KIT_URL"),
    loginURL: config.appURL + "/" + locale + "/login",
    editorHOST: config.editorHOST,
    editorURL: config.editorURL,
    URL_PATHNAME: "/" + qs,
    languages: req.app.locals.languages
  };

  if (req.user) {
    options.username = req.user.username;
    options.avatar = req.user.avatar;
    options.logoutURL = config.logoutURL;
  }

  res.render("homepage/index.html", options);
};
