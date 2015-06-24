var request = require("request");

module.exports = function(config) {
  return function(req, res) {
    var publishURL = config.publishURL;
    var token = req.user.token;
    var projectId = req.params.projectId;
    if(!projectId) {
      res.send(400, { error: "No project ID specified" });
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
        res.send(500, { error: err });
        return;
      }

      if(response.statusCode !== 204) {
        res.send(response.statusCode, { error: response.body });
        return;
      }

      res.send(204);
    });
  };
};
