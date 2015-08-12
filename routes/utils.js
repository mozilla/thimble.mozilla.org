var request = require("request");
var url = require("url");
var NodeFormData = require("form-data");
var async = require("async");

var defaultProject = require("../default");

function createProject(config, user, data, callback) {
  var project = JSON.parse(JSON.stringify(data));
  var createURL = config.publishURL + "/projects";
  delete project.id;

  if(!user) {
    callback(null, 200, project);
    return;
  }

  request({
    method: "POST",
    uri: createURL,
    headers: {
      "Authorization": "token " + user.token
    },
    body: project,
    json: true
  }, function(err, response, body) {
    if(err) {
      console.error("Failed to send request to " + createURL + " with: ", err);
      callback(err, 500);
      return;
    }

    if(response.statusCode !== 201) {
      callback(response.body, response.statusCode);
      return;
    }

    callback(null, 200, body);
  });
}

function persistProjectFiles(config, user, project, data, callback) {
  var publishURL = config.publishURL + "/files";

  function persist(file, callback) {
    var options = url.parse(publishURL);
    options.method = "POST";
    options.headers = { "Authorization": "token " + user.token };

    var formData = new NodeFormData();
    formData.append("path", file.path);
    formData.append("project_id", project.id);
    if(file.stream) {
      formData.append("buffer", file.stream, { filename: file.path, knownLength: file.size });
    } else {
      formData.append("buffer", file.buffer, { filename: file.path });
    }

    formData.submit(options, function(err, response) {
      var body = "";

      if(err) {
        console.error("Failed to send request to " + publishURL + " with: ", err);
        callback({ message: err, status: 500 });
        return;
      }

      response.once('error', function(err) {
        console.error("Failed to receive response from " + publishURL + " with: ", err);
        callback({ message: err, status: 500 });
      });

      response.on('data', function(data) {
        body += data;
      });

      response.once('end', function() {
        body = JSON.parse(body);

        if(response.statusCode !== 201) {
          callback({ message: body, status: response.statusCode });
          return;
        }

        callback();
      });
    });
  }

  if(!user) {
    callback(null, 200);
    return;
  }

  async.eachSeries(data, persist, function(err) {
    if(err) {
      callback(err.message, err.status);
    }

    callback(null, 200);
  });
}

function updateProject(config, user, data, callback) {
  if(!user) {
    callback(null, 200, data);
    return;
  }

  var project = JSON.parse(JSON.stringify(data));
  var updateURL = config.publishURL + "/projects/" + project.id;
  delete project.id;
  delete project.publish_url;

  request({
    method: "PUT",
    uri: updateURL,
    headers: {
      "Authorization": "token " + user.token
    },
    body: project,
    json: true
  }, function(err, response, body) {
    if(err) {
      console.error("Failed to send request to " + updateURL + " with: ", err);
      callback(err, 500);
      return;
    }

    if(response.statusCode !== 201 && response.statusCode !== 200) {
      callback(response.body, response.statusCode);
      return;
    }

    callback(null, 200, body);
  });
}

function getProjectFileMetadata(config, user, project, callback) {
  var url = config.publishURL + "/projects/" + project.id + "/files/meta";

  if(!user) {
    callback(null, 200, defaultProject.getPaths(config.DEFAULT_PROJECT_TITLE));
    return;
  }

  request.get({
    url: url,
    headers: {
      "Authorization": "token " + user.token
    }
  }, function(err, response, body) {
    if(err) {
      console.error("Failed to send request to " + url + " with: ", err);
      callback(err, 500);
      return;
    }

    if(response.statusCode !== 200) {
      callback(response.body, response.statusCode);
      return;
    }

    callback(null, 200, JSON.parse(body));
  });
}

function getProjectFileTar(config, user, project) {
  if(!user) {
    return defaultProject.getAsTar(config.DEFAULT_PROJECT_TITLE);
  }

  var url = config.publishURL + "/projects/" + project.id + "/files/tar";

  return request.get({
    url: url,
    headers: {
      "Authorization": "token " + user.token
    }
  });
}

function getRemixedProjectFileMetadata(config, projectId, callback) {
  var publishURL = config.publishURL + "/publishedProjects/" + projectId + "/publishedFiles/meta";

  request.get({ uri: publishURL }, function(err, response, body) {
    if(err) {
      console.error("Failed to send request to " + publishURL + " with: ", err);
      callback(err, 500);
      return;
    }

    if(response.statusCode !== 200) {
      callback(response.body, response.statusCode);
      return;
    }

    callback(null, 200, JSON.parse(body));
  });
}

function getRemixedProjectFileTar(config, projectId) {
  var publishURL = config.publishURL + "/publishedProjects/" + projectId + "/publishedFiles/tar";

  return request.get({ uri: publishURL });
}

module.exports = {
  createProject: createProject,
  persistProjectFiles: persistProjectFiles,
  updateProject: updateProject,
  getProjectFileMetadata: getProjectFileMetadata,
  getProjectFileTar: getProjectFileTar,
  getRemixedProjectFileMetadata: getRemixedProjectFileMetadata,
  getRemixedProjectFileTar: getRemixedProjectFileTar
};
