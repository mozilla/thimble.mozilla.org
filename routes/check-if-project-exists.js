var request = require("request");

module.exports = function(config) {
  return function(req, res) {
    var publishURL = config.publishURL;
    var token = req.user.token;
    var projectName = req.params.projectName;
    if(!projectName) {
      res.status(400).send({error: "No project name specified"});
      return;
    }

    request({
      method: "POST",
      url: publishURL + "/users/login",
      headers: {
        "Authorization": "token " + token
      },
      body: {
        name: req.session.user.username
      },
      json: true
    }, function(err, response, body) {
      if(err) {
        res.status(500).send({error: err});
        return;
      }

      if(response.statusCode !== 200 &&  response.statusCode !== 201) {
        res.status(response.statusCode).send({error: response.body});
        return;
      }

      var publishUser = req.session.publishUser = body;

      request.get({
        url: publishURL + "/users/" + publishUser.id + "/projects",
        headers: {
          "Authorization": "token " + token
        }
      }, function(err, response, body) {
        if(err) {
          res.status(500).send({error: err});
          return;
        }

        if(response.statusCode !== 200) {
          res.status(response.statusCode).send({error: response.body});
          return;
        }

        var projects = JSON.parse(body);
        var doesNotExist = projects.every(function(project) {
          return project.title !== projectName;
        });

        if(doesNotExist) {
          res.sendStatus(404);
        } else {
          res.sendStatus(200);
        }
      });
    });
  };
};
