"use strict";

const request = require("request");

const utils = require("../utils");
const HttpError = require("../../lib/http-error");

module.exports = function(config, req, res, next) {
  const user = req.user;
  const project = req.project;
  const dateUpdated = req.body.dateUpdated;
  const uri = `${config.publishURL}/projects/${project.id}/updatepaths`;

  request(
    {
      method: "PUT",
      uri,
      headers: {
        Authorization: `token ${user.token}`
      },
      body: req.body.paths,
      json: true
    },
    function(err, response) {
      if (err) {
        res.status(500);
        next(
          HttpError.format(
            {
              message: `Failed to send request to ${uri}, paths sent: ${JSON.stringify(
                req.body.paths,
                null,
                2
              )}`,
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
              message: `Request to ${uri} returned a status of ${response.statusCode}. Paths sent: ${JSON.stringify(
                req.body.paths,
                null,
                2
              )}`,
              context: response.body
            },
            req
          )
        );
        return;
      }

      project.date_updated = dateUpdated;

      utils.updateProject(config, user, project, function(err, status) {
        if (err) {
          res.status(status);
          next(HttpError.format(err, req));
          return;
        }

        res.sendStatus(200);
      });
    }
  );
};
