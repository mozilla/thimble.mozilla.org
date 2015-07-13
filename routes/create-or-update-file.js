var request = require("request");
var utils = require("./utils");

module.exports = function(config) {
  return function(req, res) {
    if(!req.body || !req.body.path || !req.body.buffer || !req.body.dateUpdated) {
      res.status(400).send({error: "Request body missing data"});
      return;
    }

    var token = req.user.token;
    var project = req.session.project.meta;
    var fileReceived = {
      path: req.body.path,
      buffer: req.body.buffer.data,
      project_id: project.id
    };
    var existingFile = req.session.project.files[fileReceived.path];
    var httpMethod = "POST";
    var resource = "/files";

    if(existingFile) {
      httpMethod = "PUT";
      resource += "/" + existingFile.id;
    }

    request({
      method: httpMethod,
      uri: config.publishURL + resource,
      headers: {
        "Authorization": "token " + token
      },
      body: fileReceived,
      json: true
    }, function(err, response, body) {
      if(err) {
        console.error("Failed to send request to " + config.publishURL + resource + " with: ", err);
        res.sendStatus(500);
        return;
      }

      if(response.statusCode !== 201 && response.statusCode !== 200) {
        res.status(response.statusCode).send({error: response.body});
        return;
      }

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

        if(httpMethod === "POST") {
          req.session.project.files[fileReceived.path] = {
            id: body.id,
            path: fileReceived.path,
            project_id: fileReceived.project_id
          };
          res.sendStatus(201);
          return;
        }

        res.sendStatus(200);
      });
    });
  };
};
