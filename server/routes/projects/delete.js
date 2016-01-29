var request = require("request");

module.exports = function(config, req, res) {
  var publishURL = config.publishURL;
  var token = req.user.token;
  var projectId = req.params.projectId;
  if(!projectId) {
    res.status(400).send({error: "No project ID specified"});
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
      res.status(500).send({error: err});
      return;
    }

    if(response.statusCode !== 204) {
      res.status(response.statusCode).send({error: response.body});
      return;
    }

    res.sendStatus(204);
  });
};
