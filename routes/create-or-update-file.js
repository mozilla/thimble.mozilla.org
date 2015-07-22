var utils = require("./utils");
var fs = require("fs");
var url = require("url");
var NodeFormData = require("form-data");

module.exports = function(config) {
  return function(req, res) {
    if(!req.body || !req.body.dateUpdated || !req.body.bramblePath) {
      res.status(400).send({error: "Request body missing data"});
      return;
    }

    if(!req.file) {
      res.status(400).send({error: "Request missing file data"});
      return;
    }

    var token = req.user.token;
    var project = req.session.project.meta;
    var dateUpdated = req.body.dateUpdated;
    var file = req.file;
    var filePath = utils.stripProjectRoot(req.session.project.root, req.body.bramblePath);
    var existingFile = req.session.project.files[filePath];
    var httpMethod = "post";
    var resource = "/files";

    if(existingFile) {
      httpMethod = "put";
      resource += "/" + existingFile.id;
    }

    function getUploadStream(callback) {
      var tmpFile = file.path;
      fs.stat(tmpFile, function(err, stats) {
        if(err) {
          return callback(err);
        }

        var stream = fs.createReadStream(tmpFile);
        callback(null, {size: stats.size, stream: stream});
      });
    }

    function storeFile(size, stream) {
      function cleanup() {
        var tmpFile = file.path;
        // Dump the temp file upload, but don't wait around for it to finish
        fs.unlink(tmpFile, function(err) {
          if (err) {
            console.log("unable to remove upload tmp file, `" + tmpFile + "`", err);
          }
        });
      }

      var options = url.parse(config.publishURL + resource);
      options.method = httpMethod;
      options.headers = {
        "Authorization": "token " + token
      };

      var formData = new NodeFormData();
      formData.append("path", filePath);
      formData.append("project_id", project.id);
      formData.append("buffer", stream, {knownLength: size});

      formData.submit(options, function(err, response) {
        var body = "";

        if(err) {
          console.error("Failed to send request to " + config.publishURL + resource + " with: ", err);
          res.sendStatus(500);
          cleanup();
          return;
        }

        response.on('error', function(err) {
          console.error("Failed to receive response from " + config.publishURL + resource + " with: ", err);
          res.sendStatus(500);
          cleanup();
        });

        response.on('data', function(data) {
          body += data;
        });

        response.on('end', function() {
          body = JSON.parse(body);

          if(response.statusCode !== 201 && response.statusCode !== 200) {
            res.status(response.statusCode).send({error: body});
            cleanup();
            return;
          }

          project.date_updated = dateUpdated;

          utils.updateProject(config, token, project, function(err, status, project) {
            if(err) {
              res.status(status).send({error: err});
              cleanup();
              return;
            }

            if(status === 500) {
              res.sendStatus(500);
              cleanup();
              return;
            }

            req.session.project.meta = project;

            if(httpMethod === "post") {
              req.session.project.files[filePath] = {
                id: body.id,
                path: filePath,
                project_id: project.id
              };
              res.sendStatus(201);
              cleanup();
              return;
            }

            res.sendStatus(200);
            cleanup();
          });
        });
      });
    }

    getUploadStream(function(err, result) {
      if(err) {
        console.error("Failed to read file upload buffer:", err);
        res.sendStatus(500);
        return;
      }

      storeFile(result.size, result.stream);
    });
  };
};
