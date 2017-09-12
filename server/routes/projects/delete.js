"use strict";

var request = require("request");

var HttpError = require("../../lib/http-error");

module.exports = function(config, req, res, next) {
  var publishURL = config.publishURL;
  var token = req.user.token;
  var projectId = req.params.projectId;

  if ((projectId | 0) === 0) {
    res.status(400);
    next(
      HttpError.format(
        {
          message:
            "Project ID received was " +
            projectId +
            " which is invalid and hence could not delete the project"
        },
        req
      )
    );
    return;
  }

  var deleteUrl = publishURL + "/projects/" + projectId;

  request(
    {
      method: "DELETE",
      uri: deleteUrl,
      headers: {
        Authorization: "token " + token
      }
    },
    function(err, response) {
      if (!err && response.statusCode === 204) {
        res.sendStatus(204);
        return;
      }

      var failure = false;

      if (err) {
        res.status(500);
        failure = {
          message: "Failed to send request to " + deleteUrl,
          context: err
        };
      } else {
        res.status(response.statusCode);
        failure = {
          message:
            "Request to " +
            deleteUrl +
            " returned a status of " +
            response.statusCode,
          context: response.body
        };
      }

      next(HttpError.format(failure, req));
    }
  );
};
