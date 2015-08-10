var request = require("request");
var async = require("async");
var url = require("url");
var NodeFormData = require("form-data");
var Path = require("path");

var Constants = require("../constants");

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
  var files = [];

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

        files.push({
          id: body.id,
          project_id: body.project_id,
          path: body.path
        });

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

    callback(null, 200, files);
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

function updateCurrentProjectFiles(config, user, session, project, callback) {
  var url = config.publishURL + "/projects/" + project.id + "/files";

  if(!user) {
    callback(null, 200);
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

    var files = JSON.parse(body);
    session.project.files = [];
    files.forEach(function(file) {
      session.project.files.push(file.id, file.path);
      file.path = Path.join(getProjectRoot(project), file.path);
    });

    callback(null, 200, files);
  });
}

function getRemixedProject(config, projectId, callback) {
  var publishURL = config.publishURL + "/publishedProjects/" + projectId;

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

    var publishedProject = JSON.parse(body);
    publishedProject.title = publishedProject.title + " (remix)";

    callback(null, 200, publishedProject);
  });
}

function getRemixedProjectFiles(config, projectId, callback) {
  var publishURL = config.publishURL + "/publishedProjects/" + projectId + "/publishedFiles";

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

function getFileFromArray(fileArr, path) {
  var pos = fileArr.indexOf(path);

  return pos === -1 ? null : {
    id: fileArr[pos - 1],
    path: path
  };
}

function removeFileFromArray(fileArr, id) {
  fileArr.splice(fileArr.indexOf(id), 2);
}

function getProjectRoot(project) {
  return project && project.user_id ?
         Path.join("/", project.user_id.toString(), "projects", project.id.toString()) :
         Path.join("/", project.title && project.title.length ? project.title : Constants.DEFAULT_PROJECT_NAME);
}

function stripProjectRoot(root, path) {
  return Path.join("/", Path.relative(root, path));
}

module.exports = {
  createProject: createProject,
  persistProjectFiles: persistProjectFiles,
  updateProject: updateProject,
  updateCurrentProjectFiles: updateCurrentProjectFiles,
  getRemixedProject: getRemixedProject,
  getRemixedProjectFiles: getRemixedProjectFiles,
  getFileFromArray: getFileFromArray,
  removeFileFromArray: removeFileFromArray,
  getProjectRoot: getProjectRoot,
  stripProjectRoot: stripProjectRoot
};
