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
      var unpublishURL = config.publishURL + "/projects/" + project.id + "/unpublish";

      request({
        method: "PUT",
        uri: unpublishURL,
        headers: {
          "Authorization": "token " + req.user.token
        }
      }, function(err, response) {
        if(err) {
          console.error("Failed to send request to " + unpublishURL + " with: ", err);
          res.sendStatus(500);
          return;
        }

        if(response.statusCode !== 200) {
          res.status(response.statusCode).send({error: response.body});
          return;
        }

        delete req.session.project.meta.publish_url;

        res.sendStatus(200);
      });
    });
  };
};
