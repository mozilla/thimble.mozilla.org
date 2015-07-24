var request = require("request");

module.exports = function(config) {
  return function(req, res) {
    var publishURL = config.publishURL;

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

      if(response.statusCode !== 200 && response.statusCode !== 404) {
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
