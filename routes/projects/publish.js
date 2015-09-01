var request = require("request");

var utils = require("../utils");

module.exports = function(config, req, res) {
  var project = req.project;
  project.description = req.body.description;
  // Uncomment the line below once https://github.com/mozilla/publish.webmaker.org/issues/98 is done
  // project.public = req.body.public;
  project.date_updated = req.body.dateUpdated;

  utils.updateProject(config, req.user, project, function(err, status, project) {
    if(err) {
      if(status === 500) {
        res.sendStatus(500);
      } else {
        res.status(status).send({error: err});
      }
      return;
    }

    var publishURL = config.publishURL + "/projects/" + project.id + "/publish";

    request({
      method: "PUT",
      uri: publishURL,
      headers: {
        "Authorization": "token " + req.user.token
      }
    }, function(err, response, body) {
      if(err) {
        console.error("Failed to send request to " + publishURL + " with: ", err);
        res.sendStatus(500);
        return;
      }

      if(response.statusCode !== 200) {
        res.status(response.statusCode).send({error: response.body});
        return;
      }

      var project;
      try {
        project = JSON.parse(body);
      } catch(e) {
        console.error("Failed to parse response for publishing project with ", e.message, "\n at ", e.stack);
        res.sendStatus(500);
        return;
      }

      res.status(200).send({ link: project.publish_url });
    });
  });
};
