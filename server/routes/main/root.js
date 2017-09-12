"use strict";

var querystring = require("querystring");
var uuid = require("uuid");

var utils = require("../utils");
var defaultProjectNameKey = require("../../../constants")
  .DEFAULT_PROJECT_NAME_KEY;
var HttpError = require("../../lib/http-error");

module.exports = function(config, req, res, next) {
  var user = req.user;
  var migrate = req.session.project && req.session.project.migrate;
  var localeInfo = req.localeInfo;
  var locale = localeInfo && localeInfo.lang ? localeInfo.lang : "en-US";

  var qs = querystring.stringify(req.query);
  if (qs !== "") {
    qs = "?" + qs;
  }

  res.set({
    "Cache-Control": "no-cache"
  });

  // Anonymous user: redirect to the anonymous entry point
  if (!user) {
    res.redirect(307, "/" + locale + "/anonymous/" + uuid.v4() + qs);
    return;
  }

  // Authenticated user without a selected project: redirect to the project
  // list page
  if (!migrate) {
    res.redirect(307, "/" + locale + "/projects/" + qs);
    return;
  }

  // Authenticated user migrating an anonymous project: create a placeholder
  // project (which will be updated by the client) for the project being
  // migrated for the user and redirect to the authenticated entry point
  // with the migrated project id
  var now = new Date().toISOString();
  var project = {
    title: req.gettext(
      defaultProjectNameKey,
      localeInfo && localeInfo.locale ? localeInfo.locale : "en-US"
    ),
    date_created: now,
    date_updated: now,
    user_id: user.publishId
  };

  utils.createProject(config, user, project, function(err, status, project) {
    if (err) {
      res.status(status);
      next(HttpError.format(err, req));
      return;
    }

    delete req.session.project.migrate;

    res.redirect(
      307,
      "/" + locale + "/user/" + user.username + "/" + project.id
    );
  });
};
