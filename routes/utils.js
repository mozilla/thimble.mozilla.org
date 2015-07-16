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

function getProjectRoot(project) {
  return Path.join("/", project.user_id.toString(), "projects", project.id.toString());
}

function stripProjectRoot(root, path) {
  return Path.join("/", Path.relative(root, path));
}

module.exports = {
  updateProject: updateProject,
  getProjectRoot: getProjectRoot,
  stripProjectRoot: stripProjectRoot
};
