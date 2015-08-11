var Path = require("path");

var utils = require("./utils");
var defaultProject = require("../default");

function sendResponse(res, files) {
  res.type("application/json");
  res.send({
    files: files
  });
}

module.exports = function(config) {
  return function(req, res) {
    var remixId = req.params.remixId;
    var anonymousId = req.params.anonymousId;
    var getFiles = utils.updateCurrentProjectFiles;
    var params = [config];
    var user = req.user;
    var project;

    if(!user) {
      if(!remixId) {
        sendResponse(res, defaultProject.getAsBuffers(config.DEFAULT_PROJECT_TITLE).map(function(f) {
          var file = JSON.parse(JSON.stringify(f));
          file.path = Path.join("/", anonymousId, file.path);
          return file;
        }));
        return;
      }

      getFiles = utils.getRemixedProjectFiles;
      params.push(remixId);
    } else {
      project = JSON.parse(JSON.stringify(req.session.project.meta));
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
          file.path = Path.join("/", anonymousId, file.path);
        });
      }

      sendResponse(res, files);
    });

    getFiles.apply(null, params);
  };
};
