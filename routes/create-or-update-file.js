var utils = require("./utils");
var fs = require("fs");
var url = require("url");
var NodeFormData = require("form-data");

module.exports = function(config) {
  return function(req, res) {
    if(!req.file) {
      res.status(400).send({error: "Request missing file data"});
      return;
    }

    var user = req.user;
    var token = user.token;
    var project = req.session.project.meta;
    var dateUpdated = req.body.dateUpdated;
    var file = req.file;
    var fileId = req.params.fileId;
    var filePath = req.body.bramblePath;
    var httpMethod = fileId ? "put" : "post";
    var resource = "/files" + (fileId ? "/" + fileId : "");

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
          delete body.buffer;

          if(response.statusCode !== 201 && response.statusCode !== 200) {
            res.status(response.statusCode).send({error: body});
            cleanup();
            return;
          }

          project.date_updated = dateUpdated;

          utils.updateProject(config, user, project, function(err, status, project) {
            if(err) {
              if(status === 500) {
                res.sendStatus(500);
              } else {
                res.status(status).send({error: err});
              }
              cleanup();
              return;
            }

            req.session.project.meta = project;

            res.status(httpMethod === "post" ? 201 : 200).send(body);
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
