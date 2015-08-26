var request = require("request");
var querystring = require("querystring");

module.exports = function(config, req, res) {
  var publishURL = config.publishURL;
  var user = req.user;
  var qs = querystring.stringify(req.query);
  if(qs !== "") {
    qs = "?" + qs;
  }

  request.get({
    url: publishURL + "/users/" + user.publishId + "/projects",
    headers: {
      "Authorization": "token " + user.token
    }
  }, function(err, response, body) {
    if(err) {
      res.status(500).send({error: err});
      return;
    }

    res.set({
      "Cache-Control": "no-cache"
    });

    if(response.statusCode === 404) {
      // If there aren't any projects for this user, create one with a redirect
      res.redirect(301, "/projects/new" + qs);
      return;
    }

    if(response.statusCode !== 200) {
      res.status(response.statusCode).send({error: response.body});
      return;
    }

    var options = {
      csrf: req.csrfToken ? req.csrfToken() : null,
      HTTP_STATIC_URL: "/",
      username: user.username,
      projects: JSON.parse(body),
      editorHOST: config.editorHOST
    };

    res.render("editor/projects.html", options);
  });
};
