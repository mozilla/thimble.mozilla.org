/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/* jshint node: true */

var newrelic;
if (process.env.NEW_RELIC_ENABLED) {
  newrelic = require("newrelic");
} else {
  newrelic = {
    getBrowserTimingHeader: function () {
      return "<!-- New Relic RUM disabled -->";
    },
    createTracer: function (name, handler) {
      return handler;
    }
  };
}

module.exports = function (env) {
  var express = require("express"),
    helmet = require("helmet"),
    i18n = require("webmaker-i18n"),
    lessMiddleWare = require("less-middleware"),
    WebmakerAuth = require("webmaker-auth"),
    nunjucks = require("nunjucks"),
    path = require("path"),
    route = require("./routes"),
    Models = require("../db")(env, newrelic).Models;

  var http = express(),
    nunjucksEnv = new nunjucks.Environment([
      new nunjucks.FileSystemLoader(path.join(__dirname, "views")),
      new nunjucks.FileSystemLoader(path.resolve(__dirname, "../../bower_components"))
    ], {
      autoescape: true
    });

  var webmakerAuth = new WebmakerAuth({
    loginURL: env.get("APP_HOSTNAME"),
    authLoginURL: env.get("LOGINAPI"),
    loginHost: env.get("APP_HOSTNAME"),
    secretKey: env.get("SESSION_SECRET"),
    forceSSL: env.get("FORCE_SSL"),
    domain: env.get("COOKIE_DOMAIN"),
    allowCors: env.get("ALLOWED_CORS_DOMAINS") && env.get("ALLOWED_CORS_DOMAINS").split(" ")
  });

  nunjucksEnv.addFilter("instantiate", function (input) {
    var tmpl = new nunjucks.Template(input);
    return tmpl.render(this.getVariables());
  });

  // Express Configuration
  http.configure(function () {
    nunjucksEnv.express(http);

    http.disable("x-powered-by");

    if (!env.get("DISABLE_HTTP_LOGGING")) {
      http.use(express.logger());
    }

    http.use(helmet.iexss());
    http.use(helmet.contentTypeOptions());
    http.use(helmet.xframe());

    if (!!env.get("FORCE_SSL")) {
      http.use(helmet.hsts());
      http.enable("trust proxy");
    }

    http.use(express.json());
    http.use(express.urlencoded());
    http.use(webmakerAuth.cookieParser());
    http.use(webmakerAuth.cookieSession());

    // Setup locales with i18n
    http.use(i18n.middleware({
      supported_languages: env.get("SUPPORTED_LANGS"),
      default_lang: "en-US",
      mappings: require("webmaker-locale-mapping"),
      translation_directory: path.resolve(__dirname, "../../locale")
    }));

    http.locals({
      // audience and webmakerorg are duplicated because of i18n
      AUDIENCE: env.get("WEBMAKERORG"),
      WEBMAKERORG: env.get("WEBMAKERORG"),
      newrelic: newrelic,
      profile: env.get("PROFILE"),
      bower_path: "bower_components",
      personaHostname: env.get("PERSONA_HOSTNAME", "https://login.persona.org"),
      languages: i18n.getSupportLanguages()
    });

    // need to make sure router is after i18n.middleware
    http.use(http.router);

    var optimize = env.get("NODE_ENV") !== "development",
      tmpDir = path.join(require("os").tmpDir(), "mozilla.login.webmaker.org.build");

    // convert requests for ltr- or rtl-specific CSS back to the real filename,
    // as the rtltr-for-less package was a hack that was never meant to hit production.
    http.use(function rtltrRedirect(req, res, next) {
      var path = req.path;
      if (path.match(/css\/\w+\.(ltr|rtl)\.css/)) {
        res.redirect(path.replace(/\.(ltr|rtl)/, ""));
      } else {
        next();
      }
    });

    http.use(lessMiddleWare({
      once: optimize,
      debug: !optimize,
      dest: tmpDir,
      src: path.resolve(__dirname, "public"),
      compress: optimize,
      yuicompress: optimize,
      optimization: optimize ? 0 : 2
    }));

    http.use(express.static(tmpDir));
  });

  http.configure("development", function () {
    http.use(express.errorHandler());
  });

  route(http, Models, webmakerAuth);

  http.use(express.static(path.join(__dirname, "public")));
  http.use("/bower", express.static(path.join(__dirname, "../../bower_components")));

  return http.listen(env.get("PORT"), function () {
    console.log("HTTP server listening on port " + env.get("PORT") + ".");
  });
};
