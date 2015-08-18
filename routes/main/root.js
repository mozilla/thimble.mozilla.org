var querystring = require("querystring");
var uuid = require("uuid");

var utils = require("../utils");

module.exports = function(config, req, res) {
  var user = req.user;
  var migrateProject = req.session.project && req.session.project.migrate;
  var newProjectId = req.query.newProjectId;
  delete req.query.newProjectId;

  var qs = querystring.stringify(req.query);
  if(qs !== "") {
    qs = "?" + qs;
  }

  // Anonymous user: redirect to the anonymous entry point
  if(!user) {
    res.redirect(301, "/anonymous/" + uuid.v1() + qs);
    return;
  }

  // Authenticated user creating a new project: redirect to the authenticated
  // entry point with the newly created project id
  if(newProjectId) {
    res.redirect(301, "/user/" + user.username + "/" + newProjectId + qs);
    return;
  }

  // Authenticated user without a selected project: redirect to the project
  // list page
  if(!migrateProject) {
    res.redirect(301, "/projects/" + qs);
    return;
  }

  // Authenticated user migrating an anonymous project: create the project
  // being migrated for the user and redirect to the authenticated entry
  // point with the migrated project id
  migrateProject.meta.user_id = user.publishId;

  utils.createProject(config, user, migrateProject.meta, function(err, status, project) {
    if(err) {
      if(status === 500) {
        res.sendStatus(500);
      } else {
        res.status(status).send({error: err});
      }
      return;
    }

    delete req.session.project.migrate;

    res.redirect(301, "/user/" + user.username + "/" + project.id);
  });
};
