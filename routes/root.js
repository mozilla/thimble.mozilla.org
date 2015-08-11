var querystring = require("querystring");
var uuid = require("uuid");

var home = require("./home");
var utils = require("./utils");

function showThimble(config, req, res, homepage) {
  // If we aren't migrating a project from an anonymous
  // user to an authenticated user, show Thimble immediately
  if(!req.session.project.anonymousId) {
    homepage(req, res);
    return;
  }

  var project = req.session.project.meta;
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

    req.session.project.meta = project;
    req.session.project.root = utils.getProjectRoot(project);

    homepage(req, res);
  });
}

module.exports = function(config) {
  var homepage = home(config);

  return function(req, res) {
    var qs = querystring.stringify(req.query);
    if(qs !== "") {
      qs = "?" + qs;
    }

    if(!req.user) {
      if(!req.params.anonymousId) {
        res.redirect(301, "/" + uuid.v1() + qs);
      } else {
        homepage(req, res);
      }
      return;
    }

    // TODO: Handle `/:anonId` & `/:anonId/:remixId routes
    //       for authenticated users. This will be needed for
    //       our multiple tab case where a user authenticates in one
    //       tab and refreshes another tab containing thimble.
    //       TBD: What is the "current project context" in this case?

    // Only show Thimble if a project has been set for
    // the current context
    if(req.session.project) {
      showThimble(config, homepage, req, res);
    } else {
      // Ask an authenticated user to select a project
      // to load into thimble
      res.redirect(301, "/projects/" + qs);
    }
  };
};
