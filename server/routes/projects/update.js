"use strict";

var utils = require("../utils");
var HttpError = require("../../lib/http-error");

module.exports = function(config, req, res, next) {
  var user = req.user;
  var project = req.project;

  project.title = req.body.title;
  project.description = req.body.description;
  project.date_created = req.body.dateCreated;
  project.date_updated = req.body.dateUpdated;
  project.user_id = user.publishId;

  utils.updateProject(config, user, project, function(err, status, project) {
    if (err) {
      res.status(status);
      next(HttpError.format(err, req));
      return;
    }

    res.status(status).send(project);
  });
};
