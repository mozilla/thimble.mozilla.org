var request = require("request");
var querystring = require("querystring");

module.exports = function(config) {
  return function(req, res) {
    var publishURL = config.publishURL;
    var qs = querystring.stringify(req.query);
    if(qs !== "") {
      qs = "?" + qs;
    }

    request.get({
      url: publishURL + "/users/" + req.session.publishUser.id + "/projects",
      headers: {
        "Authorization": "token " + req.user.token
      }
    }, function(err, response, body) {
      if(err) {
        res.status(500).send({error: err});
        return;
      }

      if (response.statusCode === 404) {
        // If there aren't any projects for this user, create one with a redirect
        res.redirect(301, "/newProject" + qs);
        return;
      }

      if(response.statusCode !== 200) {
        res.status(response.statusCode).send({error: response.body});
        return;
      }

      var options = {
        csrf: req.csrfToken ? req.csrfToken() : null,
        HTTP_STATIC_URL: "/",
        projects: response.statusCode === 200 ? JSON.parse(body) : [],
        PROJECT_URL: "project",
        editorHOST: config.editorHOST
      };

      res.render("projects.html", options);
    });
  };
};
