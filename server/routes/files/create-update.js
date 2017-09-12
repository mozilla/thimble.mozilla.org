"use strict";

var fs = require("fs");
var url = require("url");
var NodeFormData = require("form-data");

var utils = require("../utils");
var HttpError = require("../../lib/http-error");

module.exports = function(config, req, res, next) {
  var file = req.file;
  var fileId = req.params.fileId;
  var filePath = req.body.bramblePath;
  var errorLogSuffix = filePath ? `for path ${filePath}` : "";

  if (!file) {
    res.status(400);
    next(
      HttpError.format(
        {
          message: `File data missing from request body ${errorLogSuffix}`
        },
        req
      )
    );
    return;
  }

  var user = req.user;
  var token = user.token;
  var project = req.project;
  var dateUpdated = req.body.dateUpdated;
  var httpMethod = fileId ? "put" : "post";
  var resource = "/files" + (fileId ? "/" + fileId : "");

  function getUploadStream(callback) {
    var tmpFile = file.path;
    fs.stat(tmpFile, function(err, stats) {
      if (err) {
        return callback(err);
      }

      var stream = fs.createReadStream(tmpFile);
      callback(null, { size: stats.size, stream: stream });
    });
  }

  function storeFile(size, stream) {
    function cleanup() {
      var tmpFile = file.path;
      // Dump the temp file upload, but don't wait around for it to finish
      fs.unlink(tmpFile, function(err) {
        if (err) {
          console.error(
            "unable to remove upload tmp file, `" + tmpFile + "`",
            err
          );
        }
      });
    }

    var options = url.parse(config.publishURL + resource);
    options.method = httpMethod;
    options.headers = {
      Authorization: "token " + token
    };

    var formData = new NodeFormData();
    formData.append("path", filePath);
    formData.append("project_id", project.id);
    formData.append("buffer", stream, { knownLength: size });

    formData.submit(options, function(err, response) {
      var body = "";

      if (err) {
        res.status(500);
        next(
          HttpError.format(
            {
              message: `Failed to initiate request to ${options.pathname} ${errorLogSuffix}`,
              context: err
            },
            req
          )
        );
        cleanup();
        return;
      }

      response.on("error", function(err) {
        res.status(500);
        next(
          HttpError.format(
            {
              message: `Failed to send request to ${options.pathname} ${errorLogSuffix}`,
              context: err
            },
            req
          )
        );
        cleanup();
      });

      response.on("data", function(data) {
        body += data;
      });

      response.on("end", function() {
        try {
          body = JSON.parse(body);
        } catch (e) {
          res.status(500);
          next(
            HttpError.format(
              {
                message: `Data sent by the publish server was in an invalid format. Failed to run \`JSON.parse\` ${errorLogSuffix}`,
                context: e.message,
                stack: e.stack
              },
              req
            )
          );
          return;
        }
        delete body.buffer;

        if (response.statusCode !== 201 && response.statusCode !== 200) {
          res.status(response.statusCode);
          next(
            HttpError.format(
              {
                message: `Request to ${options.pathname} returned a status of ${response.statusCode} ${errorLogSuffix}`,
                context: body
              },
              req
            )
          );
          cleanup();
          return;
        }

        project.date_updated = dateUpdated;

        utils.updateProject(config, user, project, function(err, status) {
          if (err) {
            res.status(status);
            next(HttpError.format(err, req));
            cleanup();
            return;
          }

          res.status(httpMethod === "post" ? 201 : 200).send(body);
          cleanup();
        });
      });
    });
  }

  getUploadStream(function(err, result) {
    if (err) {
      res.status(500);
      next(
        HttpError.format(
          {
            message: `File data could not be read from stream ${errorLogSuffix}`,
            context: err
          },
          req
        )
      );
      return;
    }

    storeFile(result.size, result.stream);
  });
};
