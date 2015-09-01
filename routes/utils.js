var request = require("request");
var url = require("url");
var NodeFormData = require("form-data");
var async = require("async");

var defaultProject = require("../default");

function createProject(config, user, data, callback) {
  var createURL = config.publishURL + "/projects";
  var project;
  try {
    project = JSON.parse(JSON.stringify(data));
  } catch(e) {
    console.error("Failed to parse project with ", e.message, "\n at ", e.stack);
    callback(e, 500);
    return;
  }
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
        try {
          body = JSON.parse(body);
        } catch(e) {
          console.error("Failed to parse response for persisting files with ", e.message, "\n at ", e.stack);
          callback({ message: e.message, status: 500 });
          return;
        }

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

  var project;
  try {
   project = JSON.parse(JSON.stringify(data));
  } catch(e) {
    console.error("Failed to parse project with ", e.message, "\n at ", e.stack);
    callback(e, 500);
    return;
  }
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

    var publishedProject;
    try {
      publishedProject = JSON.parse(body);
    } catch(e) {
      console.error("Failed to parse published project with ", e.message, "\n at ", e.stack);
      callback(e, 500);
      return;
    }
    publishedProject.title = publishedProject.title + " (remix)";

    callback(null, 200, publishedProject);
  });
}

function getProjectFileMetadata(config, user, projectId, callback) {
  if(!user) {
    callback(null, 200, defaultProject.getPaths(config.DEFAULT_PROJECT_TITLE));
    return;
  }

  var url = config.publishURL + "/projects/" + projectId + "/files/meta";

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

    var files;
    try {
      files = JSON.parse(body);
    } catch(e) {
      console.error("Failed to parse project file metadata with ", e.message, "\n at ", e.stack);
      callback(e, 500);
      return;
    }

    callback(null, 200, files);
  });
}

function getProjectFileTar(config, user, projectId) {
  if(!user) {
    return defaultProject.getAsTar(config.DEFAULT_PROJECT_TITLE);
  }

  var url = config.publishURL + "/projects/" + projectId + "/files/tar";

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

    var files;
    try {
      files = JSON.parse(body);
    } catch(e) {
      console.error("Failed to parse remixed project file metadata with ", e.message, "\n at ", e.stack);
      callback(e, 500);
      return;
    }

    callback(null, 200, files);
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
  getRemixedProject: getRemixedProject,
  getProjectFileMetadata: getProjectFileMetadata,
  getProjectFileTar: getProjectFileTar,
  getRemixedProjectFileMetadata: getRemixedProjectFileMetadata,
  getRemixedProjectFileTar: getRemixedProjectFileTar
};
