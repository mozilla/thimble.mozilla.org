var request = require("request");

module.exports = function(config) {
  return function(req, res) {
    var user = req.user;
    var now = req.query.now || (new Date()).toISOString();
    var options = {
      method: user ? "PUT" : "GET",
      uri: config.publishURL + "/publishedProjects/" + req.params.projectId
    };

    if(user) {
      options.uri += "/remix?now=" + now;
      options.headers = {
        "Authorization": "token " + user.token
      };
    }

    request(options, function(err, response, body) {
      if(err) {
        console.error("Failed to send request to " + options.uri + " with: ", err);
        res.sendStatus(500);
        return;
      }

      if(response.statusCode !== 200) {
        res.status(response.statusCode).send({error: response.body});
        return;
      }

      var project = JSON.parse(body);
      req.session.project = {};

      if(!user) {
        project.title = project.title + " (remix)";
        project.date_created = now;
        project.date_updated = project.date_created;
        req.session.project.remixId = req.params.projectId;
      }

      req.session.project.meta = project;

      res.redirect(301, "/");
    });
  };
};
