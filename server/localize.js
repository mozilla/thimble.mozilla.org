"use strict";

let webmakerI18N = require("webmaker-i18n");
let path = require("path");
let bestlang = require("bestlang");

let root = path.dirname(__dirname);
let knownLocales = Object.keys(webmakerI18N.getAllLocaleCodes());

module.exports = function localize(server, options) {
  let excludeLocaleInUrl = options.excludeLocaleInUrl || [];

  server.use(
    webmakerI18N.middleware({
      supported_languages: options.supported_languages,
      default_lang: "en-US",
      translation_directory: path.resolve(root, options.locale_dest)
    })
  );

  // Redirect routes without the locale in the url to one with it.
  server.use(function(req, res, next) {
    // Do not redirect to a url with the locale if the route is in the `exclude` list
    if (excludeLocaleInUrl.indexOf(req.path) !== -1) {
      return next();
    }

    let locale =
      req.localeInfo && req.localeInfo.lang ? req.localeInfo.lang : "en-US";

    if (req.originalUrl.indexOf(locale) === 1) {
      return next();
    }

    let langPrefs = req.localeInfo.otherLangPrefs.slice();
    langPrefs.unshift(req.localeInfo.lang);
    let urlLocale = req.originalUrl.match(/^\/([^\/]*)(\/|$)/)[1];
    let bestLanguage = bestlang(
      langPrefs,
      webmakerI18N.getSupportLanguages(),
      "en-US"
    );
    let localizedUrl;

    let orgUrl = req.originalUrl;

    if (knownLocales.indexOf(urlLocale) !== -1) {
      localizedUrl = orgUrl.replace(urlLocale, bestLanguage);
    } else {
      // This regex makes sure that orgUrl always begins with `/` and inserts one if it doesn't
      localizedUrl = "/" + bestLanguage + orgUrl.replace(/^\/*/, "/");
    }

    res.redirect(307, localizedUrl);
  });

  let allLanguages = webmakerI18N.getAllLocaleCodes();
  let languages = {};
  webmakerI18N.getSupportLanguages().forEach(function(locale) {
    languages[locale] = allLanguages[locale];
  });

  server.locals.languages = languages;

  server.get("/strings/:lang?", webmakerI18N.stringsRoute("en-US"));
};
