var Path = require("path");

var utils = require("./utils");
var defaultProject = require("../default");

function sendResponse(res, project, files) {
  res.type("application/json");
  res.send({
    project: project,
    files: files
  });
}

module.exports = function(config) {
  return function(req, res) {
    var project = JSON.parse(JSON.stringify(req.session.project.meta));
    var getFiles = utils.updateCurrentProjectFiles;
    var params = [config];
    var user = req.user;

    if(!user) {
      if(!req.session.project.remixId) {
        sendResponse(res, project, defaultProject.getAsBuffers(config.DEFAULT_PROJECT_TITLE).map(function(f) {
          var file = JSON.parse(JSON.stringify(f));
          file.path = Path.join(utils.getProjectRoot(project), file.path);
          return file;
        }));
        return;
      }

      getFiles = utils.getRemixedProjectFiles;
      params.push(req.session.project.remixId);
      delete req.session.project.remixId;
    } else {
      params.push(user, req.session, project);
    }

    params.push(function(err, status, files) {
      if(err) {
        if(status === 500) {
          res.sendStatus(500);
        } else {
          res.status(status).send({error: err});
        }
        return;
      }

      if(!user) {
        files.forEach(function(file) {
          file.path = Path.join(utils.getProjectRoot(project), file.path);
        });
      }

      sendResponse(res, project, files);
    });

    getFiles.apply(null, params);
  };
};
