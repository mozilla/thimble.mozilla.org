var request = require("request");
var utils = require("./utils");

module.exports = function(config) {
  return function(req, res) {
    var project = JSON.parse(JSON.stringify(req.session.project.meta));
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

      req.session.project.meta = project;
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

        var link = JSON.parse(body).publish_url;
        req.session.project.meta.publish_url = link;

        res.status(200).send({ link: link });
      });
    });
  };
};
