"use strict";

var utils = require("../../utils");
var HttpError = require("../../../lib/http-error");

module.exports = function(config, req, res, next) {
  var user = req.user;
  var projectId = req.params.projectId;
  var getMetadata = utils.getProjectFileMetadata;
  var params = [config];

  if (!user && projectId) {
    getMetadata = utils.getRemixedProjectFileMetadata;
    params.push(projectId);
  } else {
    params.push(user, projectId);
  }

  params.push(function(err, status, metadata) {
    if (err) {
      res.status(status);
      next(HttpError.format(err, req));
      return;
    }

    res.status(200).send(metadata);
  });

  getMetadata.apply(null, params);
};
