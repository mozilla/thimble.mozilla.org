var request = require("request");

module.exports = function(config) {
  return function(req, res) {
    if(!req.body || !req.body.path) {
      res.send(400, { error: "Request body missing data" });
      return;
    }

    var existingFile = req.session.project.files[req.body.path];

    if(!existingFile) {
      res.send(400, { error: "No file representation found for " + req.body.path });
      return;
    }
    request({
      method: "DELETE",
      uri: config.publishURL + "/files/" + existingFile.id,
      headers: {
        "Authorization": "token " + req.user.token
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

      delete req.session.project.files[req.body.path];

      res.send(200);
    });
  };
};
