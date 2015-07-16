var request = require("request");
var Path = require("path");

function updateProject(config, token, data, callback) {
  var project = JSON.parse(JSON.stringify(data));
  var updateURL = config.publishURL + "/projects/" + project.id;
  delete project.id;
  delete project.publish_url;

  request({
    method: "PUT",
    uri: updateURL,
    headers: {
      "Authorization": "token " + token
    },
    body: project,
    json: true
  }, function(err, response, body) {
    if(err) {
      console.error("Failed to send request to " + updateURL + " with: ", err);
      callback(null, 500);
      return;
    }

    if(response.statusCode !== 201 && response.statusCode !== 200) {
      callback(response.body, response.statusCode);
      return;
    }

    callback(null, 200, body);
  });
}

function updateCurrentProjectFiles(config, token, session, project, callback) {
  var url = config.publishURL + "/projects/" + project.id + "/files";

  request.get({
    url: url,
    headers: {
      "Authorization": "token " + token
    }
  }, function(err, response, body) {
    if(err) {
      console.error("Failed to send request to " + url + " with: ", err);
      callback(null, 500);
      return;
    }

    if(response.statusCode !== 200) {
      callback(response.body, response.statusCode);
      return;
    }

    var files = JSON.parse(body);
    session.project.files = {};
    files.forEach(function(file) {
      var fileMeta = JSON.parse(JSON.stringify(file));
      delete fileMeta.buffer;
      session.project.files[fileMeta.path] = fileMeta;
      file.path = Path.join(getProjectRoot(project), file.path);
    });

    callback(null, 200, files);
  });
}

function getProjectRoot(project) {
  return Path.join("/", project.user_id.toString(), "projects", project.id.toString());
}

function stripProjectRoot(root, path) {
  return Path.join("/", Path.relative(root, path));
}

module.exports = {
  updateProject: updateProject,
  updateCurrentProjectFiles: updateCurrentProjectFiles,
  getProjectRoot: getProjectRoot,
  stripProjectRoot: stripProjectRoot
};
