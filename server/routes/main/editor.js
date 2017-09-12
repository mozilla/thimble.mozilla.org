"use strict";

var url = require("url");
var querystring = require("querystring");

var defaultProjectNameKey = require("../../../constants")
  .DEFAULT_PROJECT_NAME_KEY;
var utils = require("../utils");
var HttpError = require("../../lib/http-error");
var snippets = require("../../lib/snippets");

function getProjectMetadata(config, req, callback) {
  var project = req.project;
  var remixId = req.params.remixId;
  var anonymousId = req.params.anonymousId;
  var locale =
    req.localeInfo && req.localeInfo.locale ? req.localeInfo.locale : "en-US";

  if (project) {
    callback(null, 200, {
      id: project.id,
      userID: req.user.publishId,
      anonymousId: project.anonymousId,
      remixId: project.remixId,
      title: project.title,
      dateCreated: project.date_created,
      dateUpdated: project.date_updated,
      tags: project.tags,
      description: project.description,
      publishUrl: project.publish_url,
      projectLoadStrategy: config.projectLoadStrategy
    });
    return;
  }

  if (!remixId) {
    callback(null, 200, {
      anonymousId: anonymousId,
      title: req.gettext(defaultProjectNameKey, locale)
    });
    return;
  }

  utils.getRemixedProject(config, remixId, function(err, status, project) {
    if (err) {
      callback(err, status);
      return;
    }

    callback(null, 200, {
      anonymousId: anonymousId,
      remixId: remixId,
      title: project.title,
      description: project.description
    });
  });
}

module.exports = function(config, req, res, next) {
  var locale =
    req.localeInfo && req.localeInfo.lang ? req.localeInfo.lang : "en-US";
  var qs = querystring.stringify(req.query);
  if (qs !== "") {
    qs = "?" + qs;
  }

  var options = {
    appURL: config.appURL,
    URL_PATHNAME: req.originalUrl.slice(req.originalUrl.indexOf("/", 1)),
    languages: req.app.locals.languages,
    csrf: req.csrfToken(),
    editorHOST: config.editorHOST,
    loginURL: config.appURL + "/" + locale + "/login",
    logoutURL: config.logoutURL,
    queryString: qs
  };

  // We add the localization code to the query params through a URL object
  // and set search prop to nothing forcing query to be used during url.format()
  var urlObj = url.parse(req.url, true);
  urlObj.search = "";
  urlObj.query.locale = locale;
  var thimbleUrl = url.format(urlObj);

  // We forward query string params down to the editor iframe so that
  // it's easy to do things like enableExtensions/disableExtensions
  options.editorURL =
    config.editorURL + "/index.html" + (url.parse(thimbleUrl).search || "");

  if (req.user) {
    options.username = req.user.username;
    options.avatar = req.user.avatar;
  }

  getProjectMetadata(config, req, function(err, status, projectMetadata) {
    res.set({
      "Cache-Control": "no-cache"
    });

    if (err) {
      res.status(status);
      next(HttpError.format(err, req));
      return;
    }

    options.projectMetadata = encodeURIComponent(
      JSON.stringify(projectMetadata)
    );

    options.snippets = snippets;

    res.render("editor/index.html", options);
  });
};
