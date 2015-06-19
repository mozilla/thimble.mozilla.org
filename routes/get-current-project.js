var request = require("request");

module.exports = function(config) {
  return function(req, res) {
    if(!req.session.user) {
      res.send(401);
      return;
    }

    var projectId = req.session.project.meta.id;

    request.get({
      url: config.publishURL + '/projects/' + projectId + '/files',
      headers: {
        'Authorization': 'token ' + config.cryptr.decrypt(req.session.token)
      }
    }, function(err, response, body) {
      if(err) {
        // TODO: handle error
        console.error('Failed to execute request for project files');
        res.send(500);
        return;
      }

      if(response.statusCode !== 200) {
        // TODO: handle error
        console.error('Error retrieving user\'s project files: ', response.body);
        res.send(404);
        return;
      }

      var files = JSON.parse(body);
      req.session.project.files = {};
      files.forEach(function(file) {
        var fileMeta = JSON.parse(JSON.stringify(file));
        delete fileMeta.buffer;
        req.session.project.files[fileMeta.path] = fileMeta;
      });

      res.type('application/json');
      res.send({
        project: req.session.project.meta,
        files: files
      });
    });
  };
};
