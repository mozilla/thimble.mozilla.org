"use strict";

var querystring = require("querystring");

var utils = require("../utils");
var defaultProjectNameKey = require("../../../constants")
  .DEFAULT_PROJECT_NAME_KEY;
var defaultProject = require("../../../default");
var HttpError = require("../../lib/http-error");

module.exports = function(config, req, res, next) {
  var user = req.user;
  var now = req.query.now || new Date().toISOString();
  var localeInfo = req.localeInfo;
  var locale = localeInfo && localeInfo.lang ? localeInfo.lang : "en-US";

  delete req.query.now;
  delete req.query.cacheBust;
  var qs = querystring.stringify(req.query);
  if (qs !== "") {
    qs = "?" + qs;
  }

  if (!user) {
    res.redirect(307, "/" + locale + "/editor" + qs);
    return;
  }

  var project = {
    title: req.gettext(
      defaultProjectNameKey,
      localeInfo && localeInfo.locale ? localeInfo.locale : "en-US"
    ),
    date_created: now,
    date_updated: now,
    user_id: user && user.publishId
  };

  utils.createProject(config, user, project, function(err, status, project) {
    if (err) {
      res.status(status);
      next(HttpError.format(err, req));
      return;
    }

    var defaultFiles = defaultProject.getAsStreams(
      config.DEFAULT_PROJECT_TITLE
    );
    utils.persistProjectFiles(config, user, project, defaultFiles, function(
      err,
      status
    ) {
      if (err) {
        res.status(status);
        next(HttpError.format(err, req));
        return;
      }

      res.redirect(
        307,
        "/" + locale + "/user/" + user.username + "/" + project.id + qs
      );
    });
  });
};
