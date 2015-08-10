var request = require("request");
var utils = require("./utils");

module.exports = function(config) {
  return function(req, res) {
    var user = req.user;
    var project = req.session.project.meta;
    var fileId = req.params.fileId;

    if(!fileId) {
      res.status(400).send({error: "Missing file id "});
      return;
    }

    request({
      method: "DELETE",
      uri: config.publishURL + "/files/" + fileId,
      headers: {
        "Authorization": "token " + user.token
      }
    }, function(err, response) {
      if(err) {
        console.error("Failed to send request to " + config.publishURL + "/files/" + fileId + " with: ", err);
        res.sendStatus(500);
        return;
      }

      if(response.statusCode !== 204) {
        res.status(response.statusCode).send({error: response.body});
        return;
      }

      project.date_updated = req.body.dateUpdated;

      utils.updateProject(config, user, project, function(err, status, project) {
        if(err) {
          if(status === 500) {
            res.sendStatus(500);
          } else {
            res.status(status).send({error: err});
          }
          return;
        }

        req.session.project.meta = project;

        res.sendStatus(200);
      });
    });
  };
};
