var request = require("request");

module.exports = function(config) {
  return function(req, res) {
    if(!req.body || !req.body.path || !req.body.buffer) {
      res.status(400).send({error: "Request body missing data"});
      return;
    }

    var fileReceived = {
      path: req.body.path,
      buffer: req.body.buffer.data,
      project_id: req.session.project.meta.id
    };
    var existingFile = req.session.project.files[fileReceived.path];
    var httpMethod = "POST";
    var resource = "/files";

    if(existingFile) {
      httpMethod = "PUT";
      resource += "/" + existingFile.id;
    }

    request({
      method: httpMethod,
      uri: config.publishURL + resource,
      headers: {
        "Authorization": "token " + req.user.token
      },
      body: fileReceived,
      json: true
    }, function(err, response, body) {
      if(err) {
        res.status(500).send({error: err});
        return;
      }

      if(response.statusCode !== 201 && response.statusCode !== 200) {
        res.status(response.statusCode).send({error: response.body});
        return;
      }

      if(httpMethod === "POST") {
        req.session.project.files[fileReceived.path] = {
          id: body.id,
          path: fileReceived.path,
          project_id: fileReceived.project_id
        };
        res.sendStatus(201);
        return;
      }

      res.sendStatus(200);
    });
  };
};
