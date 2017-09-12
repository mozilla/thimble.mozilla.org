"use strict";

var utils = require("../utils");
var HttpError = require("../../lib/http-error");

module.exports = function(config, req, res, next) {
  req.project.title = req.body.title;

  utils.updateProject(config, req.user, req.project, function(err, status) {
    if (err) {
      res.status(status);
      next(HttpError.format(err, req));
      return;
    }

    res.sendStatus(200);
  });
};
