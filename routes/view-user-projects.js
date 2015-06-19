var request = require("request");

module.exports = function(config) {
  return function(req, res) {
    var user = req.session.user;
    var publishURL = config.publishURL;
    var token = config.cryptr.decrypt(req.session.token);

    request({
      method: "POST",
      url: publishURL + '/users/login',
      headers: {
        "Authorization": "token " + token
      },
      body: {
        name: user.username
      },
      json: true
    }, function(err, response, body) {
      if(err) {
        console.error('Error sending request', err);
        // deal with error
        return;
      }

      if(response.statusCode !== 200 &&  response.statusCode !== 201) {
        console.error('Error retrieving user: ', response);
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
          return;
        }

        if(response.statusCode !== 200) {
          console.error('Error retrieving user\'s projects: ', response.body);
          // deal with failure
          return;
        }

        var options = {
          csrf: req.csrfToken ? req.csrfToken() : null,
          HTTP_STATIC_URL: '/',
          projects: JSON.parse(body),
          PROJECT_URL: 'project',
          editorHOST: config.editorHOST
        };

        res.render('projects.html', options);
      });
    });
  };
};
