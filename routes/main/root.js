var querystring = require("querystring");
var uuid = require("uuid");

var utils = require("../utils");
var Constants = require("../../constants");

module.exports = function(config, req, res) {
  var user = req.user;
  var migrate = req.session.project && req.session.project.migrate;

  var qs = querystring.stringify(req.query);
  if(qs !== "") {
    qs = "?" + qs;
  }

  res.set({
    "Cache-Control": "no-cache"
  });

  // Anonymous user: redirect to the anonymous entry point
  if(!user) {
    res.redirect(307, "/anonymous/" + uuid.v4() + qs);
    return;
  }

  // Authenticated user without a selected project: redirect to the project
  // list page
  if(!migrate) {
    res.redirect(307, "/projects/" + qs);
    return;
  }

  // Authenticated user migrating an anonymous project: create a placeholder
  // project (which will be updated by the client) for the project being
  // migrated for the user and redirect to the authenticated entry point
  // with the migrated project id
  var now = (new Date()).toISOString();
  var project = {
    title: Constants.DEFAULT_PROJECT_NAME,
    date_created: now,
    date_updated: now,
    user_id: user.publishId
  };

  utils.createProject(config, user, project, function(err, status, project) {
    if(err) {
      if(status === 500) {
        res.sendStatus(500);
      } else {
        res.status(status).send({error: err});
      }
      return;
    }

    delete req.session.project.migrate;

    res.redirect(307, "/user/" + user.username + "/" + project.id);
  });
};
