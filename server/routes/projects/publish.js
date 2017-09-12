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

    var publishURL = config.publishURL + "/projects/" + project.id + "/publish";

    request(
      {
        method: "PUT",
        uri: publishURL,
        headers: {
          Authorization: "token " + req.user.token
        }
      },
      function(err, response, body) {
        var failure = false;

        if (err) {
          res.status(500);
          failure = {
            message: "Failed to send request to " + publishURL,
            context: err
          };
        } else if (response.statusCode !== 200) {
          res.status(response.statusCode);
          failure = {
            message:
              "Request to " +
              publishURL +
              " returned a status of " +
              response.statusCode,
            context: response.body
          };
        }

        if (failure) {
          next(HttpError.format(failure, req));
          return;
        }

        var project;
        try {
          project = JSON.parse(body);
        } catch (e) {
          res.status(500);
          next(
            HttpError.format(
              {
                message:
                  "Project sent by calling function was in an invalid format. Failed to run `JSON.parse`",
                context: e.message,
                stack: e.stack
              },
              req
            )
          );
          return;
        }

        res.status(200).send({ link: project.publish_url });
      }
    );
  });
};
