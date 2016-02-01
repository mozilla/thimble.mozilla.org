var editor = require("./editor");
var utils = require("../utils");
var defaultProjectNameKey = require("../../../constants").DEFAULT_PROJECT_NAME_KEY;

function getProject(config, req, remixId, callback) {
  if(!remixId) {
    callback(null, 200, {
      title: req.gettext(defaultProjectNameKey, req.localeInfo.locale)
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

  getProject(config, req, remixId, function(err, status, project) {
    if(err) {
      if(status === 500) {
        res.sendStatus(500);
      } else {
        res.status(status).send({error: err});
      }
      return;
    }

    var now = (new Date()).toISOString();

    project.date_created = now;
    project.date_updated = now;
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

      var locale = req.localeInfo && req.localeInfo.lang || "en-US";

      // Temporarily cache the anonymous remix id in the session
      req.session.project = {
        anonymousId: req.params.anonymousId,
        remixId: remixId
      };

      // And finally redirect to the authenticated user's main entry point
      res.redirect(307, "/" + locale + "/user/" + user.username + "/" + project.id);
    });
  });
};
