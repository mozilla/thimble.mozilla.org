var request = require("request");

module.exports = function(config) {
  return function(req, res) {
console.log("HERERE");
    if(!config.authorized(req, res)) {
      res.send(401);
      return;
    }

    if(!req.body || !req.body.path) {
      // TODO: handle error
      console.error('Request body missing data: ', req.body);
      res.send(400);
      return;
    }

    var existingFile = req.session.project.files[req.body.path];

    if(!existingFile) {
      console.error('No file representation found for ', req.body.path);
      res.send(400);
      return;
    }
    request({
      method: 'DELETE',
      uri: config.publishURL + '/files/' + existingFile.id,
      headers: {
        "Authorization": "token " + config.cryptr.decrypt(req.session.token)
      }
    }, function(err, response) {
      if(err) {
        // TODO: handle error
        console.error('Failed to send DELETE request for ', existingFile.path);
        res.send(500);
        return;
      }

      if(response.statusCode !== 204) {
        console.error('Error deleting project file: ', response.body);
        res.send(response.statusCode);
        return;
      }

      delete req.session.project.files[req.body.path];

      res.send(200);
    });
  };
};
