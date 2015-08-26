var editor = require("./editor");
var utils = require("../utils");
var Constants = require("../../constants");

function getProject(config, remixId, callback) {
  var now = (new Date()).toISOString();

  if(!remixId) {
    callback(null, 200, {
      title: Constants.DEFAULT_PROJECT_NAME,
      date_created: now,
      date_updated: now
    });
    return;
  }

  utils.getRemixedProject(config, remixId, callback);
}

module.exports = function(config, req, res) {
  var user = req.user;
  // If an anonymous user enters through this anonymous entry point, show them
  // thimble immediately
  if(!user) {
    editor.call(this, config, req, res);
    return;
  }

  // Otherwise, upgrade the anonymous project for the authenticated user
  var remixId = req.params.remixId;

  getProject(config, remixId, function(err, status, project) {
    if(err) {
      if(status === 500) {
        res.sendStatus(500);
      } else {
        res.status(status).send({error: err});
      }
      return;
    }

    project.user_id = user.publishId;

    utils.createProject(config, user, project, function(err, status, project) {
      if(err) {
        if(status === 500) {
          res.sendStatus(500);
        } else {
          res.status(status).send({error: err});
        }
        return;
      }

      // Temporarily cache the anonymous remix id in the session
      req.session.project = {
        anonymousId: req.params.anonymousId,
        remixId: remixId
      };

      // And finally redirect to the authenticated user's main entry point
      res.redirect(307, "/user/" + user.username + "/" + project.id);
    });
  });
};
