var request = require("request");

module.exports = function(config) {
  return function(req, res) {
    var user = req.user;
    var publishURL = config.publishURL;
    var token = user.token;

    request({
      method: "POST",
      url: publishURL + "/users/login",
      headers: {
        "Authorization": "token " + token
      },
      body: {
        name: user.username
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

        var options = {
          csrf: req.csrfToken ? req.csrfToken() : null,
          HTTP_STATIC_URL: "/",
          projects: JSON.parse(body),
          PROJECT_URL: "project",
          editorHOST: config.editorHOST
        };

        res.render("projects.html", options);
      });
    });
  };
};
