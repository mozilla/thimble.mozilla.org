"use strict";

const request = require("request");

const utils = require("../utils");

module.exports = function(config, req, res) {
  const user = req.user;
  const project = req.project;
  const dateUpdated = req.body.dateUpdated;
  const uri = `${config.publishURL}/projects/${project.id}/updatepaths`;

  request({
    method: "PUT",
    uri,
    headers: {
      "Authorization": `token ${user.token}`
    },
    body: req.body.paths,
    json: true
  }, function(err, response) {
    if(err) {
      console.error(`Failed to send request to ${uri} with: ${err}`);
      res.sendStatus(500);
      return;
    }

    if(response.statusCode !== 200) {
      res.status(response.statusCode).send({error: response.body});
      return;
    }

    project.date_updated = dateUpdated;

    utils.updateProject(config, user, project, function(err, status) {
      if(err) {
        if(status === 500) {
          res.sendStatus(500);
        } else {
          res.status(status).send({error: err});
        }
        return;
      }

      res.sendStatus(200);
    });
  });
};
