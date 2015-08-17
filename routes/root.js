var querystring = require("querystring");

var home = require("./home");
var utils = require("./utils");

module.exports = function(config) {
  var homepage = home(config);

  return function(req, res) {
    var qs = querystring.stringify(req.query);
    if(qs !== "") {
      qs = "?" + qs;
    }

    // Only show Thimble if a project has been set for
    // the current context
    if(!req.session.project) {
      // Otherwise, ask an authenticated user to select
      // a project to load into thimble
      res.redirect(301, "/projects/" + qs);
      return;
    }

    // If we aren't migrating a project from an anonymous
    // user to an authenticated user, show Thimble immediately
    if(!req.session.project.migrate) {
      homepage(req, res);
      return;
    }

    var project = req.session.project.migrate.meta;
    project.user_id = req.session.publishUser.id;

    utils.createProject(config, req.user, project, function(err, status, project) {
      if(err) {
        if(status === 500) {
          res.sendStatus(500);
        } else {
          res.status(status).send({error: err});
        }
        return;
      }

      req.session.project = {
        meta: project,
        anonymousId: req.session.project.migrate.anonymousId
      };

      homepage(req, res);
    });
  };
};
