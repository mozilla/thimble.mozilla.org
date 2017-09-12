"use strict";

var request = require("request");
var uuid = require("uuid");

var HttpError = require("../../lib/http-error");

module.exports = function(config, req, res, next) {
  var locale =
    req.localeInfo && req.localeInfo.lang ? req.localeInfo.lang : "en-US";
  var publishedId = req.params.publishedId;
  var user = req.user;
  if (!user) {
    res.redirect(
      307,
      "/" + locale + "/anonymous/" + uuid.v4() + "/" + publishedId
    );
    return;
  }

  var now = req.query.now || new Date().toISOString();
  var options = {
    method: "PUT",
    uri:
      config.publishURL +
      "/publishedProjects/" +
      publishedId +
      "/remix?now=" +
      now,
    headers: {
      Authorization: "token " + user.token
    }
  };

  request(options, function(err, response, body) {
    if (err) {
      res.status(500);
      next(
        HttpError.format(
          {
            message: "Failed to send request to " + options.uri,
            context: err
          },
          req
        )
      );
      return;
    }

    if (response.statusCode !== 200) {
      res.status(response.statusCode);
      next(
        HttpError.format(
          {
            message:
              "Request to " +
              options.uri +
              " returned a status of " +
              response.statusCode,
            context: response.body
          },
          req
        )
      );
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

    res.redirect(
      307,
      "/" + locale + "/user/" + user.username + "/" + project.id
    );
  });
};
