var request = require("request");
var async = require("async");

module.exports = function(config) {
  return function(req, res) {
    var publishURL = config.publishURL;
    var token = config.cryptr.decrypt(req.session.token);

    if(!req.session.user) {
      // TODO: handle error
      console.error("Unauthorized request");
      res.send(401);
      return;
    }

    var projectId = req.params.projectId;
    if(!projectId) {
      // TODO: handle error
      console.error("No project ID specified");
      res.send(400);
      return;
    }

    request.get({
      url: publishURL + "/projects/" + projectId + "/files",
      headers: {
        "Authorization": "token " + token
      }
    }, function(err, response, body) {
      if(err) {
        // TODO: handle error
        console.error("Failed to execute request for project files");
        res.send(500);
        return;
      }

      if(response.statusCode !== 200) {
        // TODO: handle error
        console.error("Error retrieving user's project files: ", response.body);
        res.send(404);
        return;
      }

      var files = JSON.parse(body);

      function deleteFile(file, callback) {
        request({
          method: "DELETE",
          uri: publishURL + "/files/" + file.id,
          headers: {
            "Authorization": "token " + token
          }
        }, function(err, response) {
          if(err) {
            console.error("Failed to send DELETE request for ", file.path);
            callback(500);
            return;
          }

          if(response.statusCode !== 204) {
            console.error("Error deleting project file: ", response.body);
            callback(response.statusCode);
            return;
          }

          callback();
        });
      }

      async.eachSeries(files, deleteFile, function(err) {
        if(err) {
          res.send(err);
          return;
        }

        request({
          method: "DELETE",
          uri: publishURL + "/projects/" + projectId,
          headers: {
            "Authorization": "token " + token
          }
        }, function(err, response) {
          if(err) {
            console.error("Failed to send DELETE request for project");
            res.send(500);
            return;
          }

          if(response.statusCode !== 204) {
            console.error("Error deleting project: ", response.body);
            res.send(response.statusCode);
            return;
          }

          res.send(204);
        });
      });
    });
  };
};
