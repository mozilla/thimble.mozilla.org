var request = require("request");

var utils = require("../utils");
const HttpError = require("../../lib/http-error");

module.exports = function(config, req, res, next) {
  var user = req.user;
  var project = req.project;
  var fileId = req.params.fileId;
  const url = config.publishURL + "/files/" + fileId;

  request({
    method: "DELETE",
    uri: url,
    headers: {
      "Authorization": "token " + user.token
    }
  }, function(err, response) {
    if(err) {
      res.status(500);
      next(
        HttpError.format({
          userMessageKey: "errorRequestFailureDeletingFile",
          message: `Failed to send request to ${url}`,
          context: err
        }, req)
      );
      return;
    }

    if(response.statusCode !== 204) {
      res.status(status);
      next(
        HttpError.format({
          userMessageKey: "errorUnknownResponseDeletingFile",
          message: `Request to ${url} returned a status of ${response.statusCode}`,
          context: response.body
        }, req)
      );
      return;
    }

    project.date_updated = req.query.dateUpdated || (new Date()).toISOString();

    utils.updateProject(config, user, project, function(err, status) {
      if(err) {
        res.status(status);
        next(HttpError.format(err, req));
        return;
      }

      res.sendStatus(200);
    });
  });
};
