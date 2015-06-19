var request = require("request");

module.exports = function(config) {
  return function(req, res) {
    if(!config.authorized(req, res)) {
      return;
    }

    if(!req.body || !req.body.path || !req.body.buffer) {
      // TODO: handle error
      console.error('Request body missing data: ', req.body);
      res.send(400);
      return;
    }

    var fileReceived = {
      path: req.body.path,
      buffer: req.body.buffer.data,
      project_id: req.session.project.meta.id
    };
    var existingFile = req.session.project.files[fileReceived.path];
    var httpMethod = 'POST';
    var resource = '/files';

    if(existingFile) {
      httpMethod = 'PUT';
      resource += '/' + existingFile.id;
    }

    request({
      method: httpMethod,
      uri: config.publishURL + resource,
      headers: {
        "Authorization": "token " + config.cryptr.decrypt(req.session.token)
      },
      body: fileReceived,
      json: true
    }, function(err, response, body) {
      if(err) {
        // TODO: handle error
        console.error('Failed to send ' + httpMethod + ' request');
        res.send(500);
        return;
      }

      if(response.statusCode !== 201 && response.statusCode !== 200) {
        console.error('Error updating project file: ', response.body);
        res.send(response.statusCode);
        return;
      }

      if(httpMethod === 'POST') {
        req.session.project.files[fileReceived.path] = {
          id: body.id,
          path: fileReceived.path,
          project_id: fileReceived.project_id
        };
        res.send(201);
        return;
      }

      res.send(200);
    });
  };
};
