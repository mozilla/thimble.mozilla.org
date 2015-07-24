var request = require("request");
var utils = require("./utils");

module.exports = function(config) {
  return function(req, res) {
    var user = req.user;
    var publishURL = config.publishURL + "/publishedProjects/" + req.params.projectId;

    request.get({ uri: publishURL }, function(err, response, body) {
      if(err) {
        console.error("Failed to send request to " + publishURL + " with: ", err);
        res.sendStatus(500);
        return;
      }

      if(response.statusCode !== 200) {
        res.status(response.statusCode).send({error: response.body});
        return;
      }

      var publishedProject = JSON.parse(body);
      publishedProject.date_created = req.query.now || (new Date()).toISOString();
      publishedProject.date_updated = publishedProject.date_created;

      utils.createProject(config, user, publishedProject, function(err, status, project) {
        if(err) {
          res.status(status).send({error: err});
          return;
        }

        if(status === 500) {
          res.sendStatus(500);
          return;
        }

        publishURL += "/files";

        req.session.project = {};
        req.session.project.root = utils.getProjectRoot(project);
        req.session.project.meta = project;

        request.get({ uri: publishURL }, function(err, response, body) {
          if(err) {
            console.error("Failed to send request to " + publishURL + " with: ", err);
            res.sendStatus(500);
            return;
          }

          if(response.statusCode !== 200) {
            res.status(response.statusCode).send({error: response.body});
            return;
          }

          var publishedFiles = JSON.parse(body);

          utils.persistProjectFiles(config, user, project, publishedFiles, function(err, status, files) {
            if(err) {
              console.error("Failed to send request to " + publishURL + " with: ", err);
              res.sendStatus(500);
              return;
            }

            if(response.statusCode !== 200) {
              res.status(response.statusCode).send({error: response.body});
              return;
            }

            req.session.project.files = files;

            res.redirect(301, "/");
          });
        });
      });
    });
  };
};
