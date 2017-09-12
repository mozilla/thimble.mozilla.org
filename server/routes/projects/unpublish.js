"use strict";

var request = require("request");

var utils = require("../utils");
var HttpError = require("../../lib/http-error");

module.exports = function(config, req, res, next) {
  var project = req.project;
  project.description = req.body.description;
  // Uncomment the line below once https://github.com/mozilla/publish.webmaker.org/issues/98 is done
  // project.public = req.body.public;
  project.date_updated = req.body.dateUpdated;

  utils.updateProject(config, req.user, project, function(
    err,
    status,
    project
  ) {
    if (err) {
      res.status(status);
      next(HttpError.format(err, req));
      return;
    }

    var unpublishURL =
      config.publishURL + "/projects/" + project.id + "/unpublish";

    request(
      {
        method: "PUT",
        uri: unpublishURL,
        headers: {
          Authorization: "token " + req.user.token
        }
      },
      function(err, response) {
        if (!err && response.statusCode === 200) {
          res.sendStatus(200);
          return;
        }

        var failure = false;

        if (err) {
          res.status(500);
          failure = {
            message: "Failed to send request to " + unpublishURL,
            context: err
          };
        } else {
          res.status(response.statusCode);
          failure = {
            message:
              "Request to " +
              unpublishURL +
              " returned a status of " +
              response.statusCode,
            context: response.body
          };
        }

        next(HttpError.format(failure, req));
      }
    );
  });
};
