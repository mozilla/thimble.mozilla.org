"use strict";

let webmakerI18N = require("webmaker-i18n");
let webmakerLocaleMapping = require("webmaker-locale-mapping");
let path = require("path");

let root = path.dirname(__dirname);

module.exports = function localize(server, options) {
  server.use(webmakerI18N.middleware({
    supported_languages: options.supported_languages,
    default_lang: "en-US",
    mappings: webmakerLocaleMapping,
    translation_directory: path.resolve(root, options.locale_dest)
  }));

  server.locals.languages = webmakerI18N.getSupportLanguages();

  server.get("/strings/:lang?", webmakerI18N.stringsRoute('en-US'));
};
