var request = require("request");
var utils = require("./utils");

module.exports = function(config) {
  return function(req, res) {
    if(!req.body || !req.body.path || !req.body.dateUpdated) {
      res.status(400).send({error: "Request body missing data"});
      return;
    }

    var token = req.user.token;
    var project = req.session.project.meta;
    var existingFile = req.session.project.files[req.body.path];

    if(!existingFile) {
      res.status(400).send({error: "No file representation found for " + req.body.path});
      return;
    }
    request({
      method: "DELETE",
      uri: config.publishURL + "/files/" + existingFile.id,
      headers: {
        "Authorization": "token " + req.user.token
      }
    }, function(err, response) {
      if(err) {
        console.error("Failed to send request to " + config.publishURL + "/files/" + existingFile.id + " with: ", err);
        res.sendStatus(500);
        return;
      }

      if(response.statusCode !== 204) {
        res.status(response.statusCode).send({error: response.body});
        return;
      }

      delete req.session.project.files[req.body.path];
      project.date_updated = req.body.dateUpdated;

      utils.updateProject(config, token, project, function(err, status, project) {
        if(err) {
          res.status(status).send({error: err});
          return;
        }

        if(status === 500) {
          res.sendStatus(500);
          return;
        }

        req.session.project.meta = project;

        res.sendStatus(200);
      });
    });
  };
};
