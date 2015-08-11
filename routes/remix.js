var uuid = require("uuid");

var utils = require("./utils");

module.exports = function(config) {
  return function(req, res) {
    var projectId = req.params.projectId;
    var user = req.user;
    if(!user) {
      res.redirect("/" + uuid.v1() + "/" + projectId);
      return;
    }

    var publishURL = config.publishURL + "/publishedProjects/" + projectId;

    utils.getRemixedProject(config, req.params.projectId, function(err, status, publishedProject) {
      if(err) {
        if(status === 500) {
          res.sendStatus(500);
        } else {
          res.status(status).send({error: err});
        }
        return;
      }

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

            if(user) {
              req.session.project.files = [];
              files.forEach(function(file) {
                req.session.project.files.push(file.id, file.path);
              });
            }

            res.redirect(301, "/");
          });
        });
      });
    });
  };
};
