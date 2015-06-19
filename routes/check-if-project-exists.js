var request = require("request");

module.exports = function(config) {
  return function(req, res) {
    var publishURL = config.publishURL;
    var token = config.cryptr.decrypt(req.session.token);

    if(!req.session.user) {
      res.redirect(301, '/');
      return;
    }

    var projectName = req.params.projectName;
    if(!projectName) {
      // TODO: handle error
      console.error('No project name specified');
      res.send(400);
      return;
    }

    request({
      method: "POST",
      url: publishURL + '/users/login',
      headers: {
        "Authorization": "token " + token
      },
      body: {
        name: req.session.user.username
      },
      json: true
    }, function(err, response, body) {
      if(err) {
        console.error('Error sending request', err);
        res.send(500);
        // deal with error
        return;
      }

      if(response.statusCode !== 200 &&  response.statusCode !== 201) {
        console.error('Error retrieving user: ', response.body);
        res.send(500);
        // deal with failure
        return;
      }

      var publishUser = req.session.publishUser = body;

      request.get({
        url: publishURL + '/users/' + publishUser.id + '/projects',
        headers: {
          "Authorization": "token " + token
        }
      }, function(err, response, body) {
        if(err) {
          console.error('Error sending request', err);
          // deal with error
          res.send(500);
          return;
        }

        if(response.statusCode !== 200) {
          console.error('Error retrieving user\'s projects: ', response.body);
          // deal with failure
          res.send(500);
          return;
        }

        var projects = JSON.parse(body);
        var doesNotExist = projects.every(function(project) {
          return project.title !== projectName;
        });

        if(doesNotExist) {
          res.send(404);
        } else {
          res.send(200);
        }
      });
    });
  };
};
