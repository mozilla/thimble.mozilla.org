var request = require("request");
var url = require("url");
var NodeFormData = require("form-data");
var async = require("async");

var defaultProject = require("../../default");

function createProject(config, user, data, callback) {
  var createURL = config.publishURL + "/projects";
  var project;
  try {
    project = JSON.parse(JSON.stringify(data));
  } catch (e) {
    callback(
      {
        message:
          "Project sent by calling function was in an invalid format. Failed to run `JSON.parse`",
        context: e.message,
        stack: e.stack
      },
      500
    );
    return;
  }
  delete project.id;

  if (!user) {
    callback(null, 200, project);
    return;
  }

  request(
    {
      method: "POST",
      uri: createURL,
      headers: {
        Authorization: "token " + user.token
      },
      body: project,
      json: true
    },
    function(err, response, body) {
      if (err) {
        callback(
          {
            message: "Failed to send request to " + createURL,
            context: err
          },
          500
        );
        return;
      }

      if (response.statusCode !== 201) {
        callback(
          {
            message:
              "Request to " +
              createURL +
              " returned a status of " +
              response.statusCode,
            context: response.body
          },
          response.statusCode
        );
        return;
      }

      callback(null, 200, body);
    }
  );
}

function persistProjectFiles(config, user, project, data, callback) {
  var publishURL = config.publishURL + "/files";

  function persist(file, callback) {
    var options = url.parse(publishURL);
    options.method = "POST";
    options.headers = { Authorization: "token " + user.token };

    var formData = new NodeFormData();
    formData.append("path", file.path);
    formData.append("project_id", project.id);
    if (file.stream) {
      formData.append("buffer", file.stream, {
        filename: file.path,
        knownLength: file.size
      });
    } else {
      formData.append("buffer", file.buffer, { filename: file.path });
    }

    formData.submit(options, function(err, response) {
      var body = "";

      if (err) {
        callback({
          error: {
            message: "Failed to initiate request to " + publishURL,
            context: err
          },
          status: 500
        });
        return;
      }

      response.once("error", function(err) {
        callback({
          error: {
            message: "Failed to send request to " + publishURL,
            context: err
          },
          status: 500
        });
      });

      response.on("data", function(data) {
        body += data;
      });

      response.once("end", function() {
        try {
          body = JSON.parse(body);
        } catch (e) {
          callback({
            error: {
              message:
                "Data sent by the publish server was in an invalid format. Failed to run `JSON.parse`",
              context: e.message,
              stack: e.stack
            },
            status: 500
          });
          return;
        }

        if (response.statusCode !== 201) {
          callback({
            error: {
              message:
                "Request to " +
                publishURL +
                " returned a status of " +
                response.statusCode,
              context: body
            },
            status: 500
          });
          return;
        }

        callback();
      });
    });
  }

  if (!user) {
    callback(null, 200);
    return;
  }

  async.eachSeries(data, persist, function(err) {
    if (err) {
      callback(err.error, err.status);
    }

    callback(null, 200);
  });
}

function updateProject(config, user, data, callback) {
  if (!user) {
    callback(null, 200, data);
    return;
  }

  var project;
  try {
    project = JSON.parse(JSON.stringify(data));
  } catch (e) {
    callback(
      {
        message:
          "Project sent by calling function was in an invalid format. Failed to run `JSON.parse`",
        context: e.message,
        stack: e.stack
      },
      500
    );
    return;
  }
  var updateURL = config.publishURL + "/projects/" + project.id;
  delete project.id;
  delete project.publish_url;

  request(
    {
      method: "PUT",
      uri: updateURL,
      headers: {
        Authorization: "token " + user.token
      },
      body: project,
      json: true
    },
    function(err, response, body) {
      if (err) {
        callback(
          {
            message: "Failed to send request to " + updateURL,
            context: err
          },
          500
        );
        return;
      }

      if (response.statusCode !== 201 && response.statusCode !== 200) {
        callback(
          {
            message:
              "Request to " +
              updateURL +
              " returned a status of " +
              response.statusCode,
            context: response.body
          },
          response.statusCode
        );
        return;
      }

      callback(null, 200, body);
    }
  );
}

function getRemixedProject(config, projectId, callback) {
  var publishURL = config.publishURL + "/publishedProjects/" + projectId;

  request.get({ uri: publishURL }, function(err, response, body) {
    if (err) {
      callback(
        {
          message: "Failed to send request to " + publishURL,
          context: err
        },
        500
      );
      return;
    }

    if (response.statusCode !== 200) {
      callback(
        {
          message:
            "Request to " +
            publishURL +
            " returned a status of " +
            response.statusCode,
          context: response.body
        },
        response.statusCode
      );
      return;
    }

    var publishedProject;
    try {
      publishedProject = JSON.parse(body);
    } catch (e) {
      callback(
        {
          message: `Project data received by the publish server for ${publishURL} was in an invalid format. Failed to run \`JSON.parse\``,
          context: e.message,
          stack: e.stack
        },
        500
      );
      return;
    }
    publishedProject.title = publishedProject.title + " (remix)";

    callback(null, 200, publishedProject);
  });
}

function getProjectFileMetadata(config, user, projectId, callback) {
  if (!user) {
    callback(null, 200, defaultProject.getPaths(config.DEFAULT_PROJECT_TITLE));
    return;
  }

  var url = config.publishURL + "/projects/" + projectId + "/files/meta";

  request.get(
    {
      url: url,
      headers: {
        Authorization: "token " + user.token
      }
    },
    function(err, response, body) {
      if (err) {
        callback(
          {
            message: "Failed to send request to " + url,
            context: err
          },
          500
        );
        return;
      }

      if (response.statusCode !== 200) {
        callback(
          {
            message:
              "Request to " +
              url +
              " returned a status of " +
              response.statusCode,
            context: response.body
          },
          response.statusCode
        );
        return;
      }

      var files;
      try {
        files = JSON.parse(body);
      } catch (e) {
        callback(
          {
            message: `Project data received by the publish server for ${url} was in an invalid format. Failed to run \`JSON.parse\``,
            context: e.message,
            stack: e.stack
          },
          500
        );
        return;
      }

      callback(null, 200, files);
    }
  );
}

function getProjectFileTar(config, user, projectId) {
  if (!user) {
    return defaultProject.getAsTar(config.DEFAULT_PROJECT_TITLE);
  }

  var url = config.publishURL + "/projects/" + projectId + "/files/tar";

  return request.get({
    url: url,
    headers: {
      Authorization: "token " + user.token
    }
  });
}

function getProjectFile(config, user, fileId) {
  var url = config.publishURL + "/files/" + fileId;

  return request.get({
    url: url,
    headers: {
      Authorization: "token " + user.token
    }
  });
}

function getRemixedProjectFileMetadata(config, projectId, callback) {
  var publishURL =
    config.publishURL +
    "/publishedProjects/" +
    projectId +
    "/publishedFiles/meta";

  request.get({ uri: publishURL }, function(err, response, body) {
    if (err) {
      callback(
        {
          message: "Failed to send request to " + publishURL,
          context: err
        },
        500
      );
      return;
    }

    if (response.statusCode !== 200) {
      callback(
        {
          message:
            "Request to " +
            publishURL +
            " returned a status of " +
            response.statusCode,
          context: response.body
        },
        response.statusCode
      );
      return;
    }

    var files;
    try {
      files = JSON.parse(body);
    } catch (e) {
      callback(
        {
          message: `Project data received by the publish server for ${publishURL} was in an invalid format. Failed to run \`JSON.parse\``,
          context: e.message,
          stack: e.stack
        },
        500
      );
      return;
    }

    callback(null, 200, files);
  });
}

function getRemixedProjectFileTar(config, projectId) {
  var publishURL =
    config.publishURL +
    "/publishedProjects/" +
    projectId +
    "/publishedFiles/tar";

  return request.get({ uri: publishURL });
}

function sendResponseStream(res, binaryStream) {
  // NOTE: this should be `application/x-tar`, but IE won't decompress the
  // stream if we use that.  With `application/octet-stream` it works everywhere.
  res.type("application/octet-stream");
  binaryStream
    .on("error", function(err) {
      console.error("Failed to stream binary data with: ", err);
    })
    .pipe(res);
}

module.exports = {
  createProject: createProject,
  persistProjectFiles: persistProjectFiles,
  updateProject: updateProject,
  getRemixedProject: getRemixedProject,
  getProjectFileMetadata: getProjectFileMetadata,
  getProjectFileTar: getProjectFileTar,
  getProjectFile: getProjectFile,
  getRemixedProjectFileMetadata: getRemixedProjectFileMetadata,
  getRemixedProjectFileTar: getRemixedProjectFileTar,
  sendResponseStream
};
