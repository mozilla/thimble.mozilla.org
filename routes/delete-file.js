var request = require("request");

module.exports = function(config) {
  return function(req, res) {
    if(!req.body || !req.body.path) {
      res.status(400).send({error: "Request body missing data"});
      return;
    }

    var existingFile = req.session.project.files[req.body.path];

    if(!existingFile) {
      res.status(400).send({error: "No file representation found for " + req.body.path});
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
        res.status(500).send({error: err});
        return;
      }

      if(response.statusCode !== 204) {
        res.status(response.statusCode).send({error: response.body});
        return;
      }

      delete req.session.project.files[req.body.path];

      res.sendStatus(200);
    });
  };
};
