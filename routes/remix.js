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
      publishedProject.title = publishedProject.title + " (remix)";
      publishedProject.date_created = req.query.now || (new Date()).toISOString();
      publishedProject.date_updated = publishedProject.date_created;
      publishedProject.user_id = req.session.publishUser && req.session.publishUser.id;

      utils.createProject(config, user, publishedProject, function(err, status, project) {
        if(err) {
          if(status === 500) {
            res.sendStatus(500);
          } else {
            res.status(status).send({error: err});
          }
          return;
        }

        publishURL += "/publishedFiles";

        req.session.project = {};
        req.session.project.root = utils.getProjectRoot(project);
        req.session.project.meta = project;

        if(!user) {
          req.session.project.remixId = req.params.projectId;
          res.redirect(301, "/");
          return;
        }

        utils.getRemixedProjectFiles(config, publishedProject.id, function(err, response, publishedFiles) {
          if(err) {
            if(status === 500) {
              res.sendStatus(500);
            } else {
              res.status(status).send({error: err});
            }
            return;
          }

          publishedFiles.forEach(function(file) {
            file.buffer = new Buffer(file.buffer);
          });

          utils.persistProjectFiles(config, user, project, publishedFiles, function(err, status, files) {
            if(err) {
              if(status === 500) {
                res.sendStatus(500);
              } else {
                res.status(status).send({error: err});
              }
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
