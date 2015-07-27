var querystring = require("querystring");

var utils = require("./utils");
var Constants = require("../constants");
var DefaultProject = require("../default")(true)["stay-calm"];

module.exports = function(config) {
  return function(req, res) {
    var qs;
    var user = req.user;
    var now = req.query.now || (new Date()).toISOString();
    var project = {
      title: Constants.DEFAULT_PROJECT_NAME,
      date_created: now,
      date_updated: now,
      user_id: user ? req.session.publishUser.id : null
    };

    delete req.query.now;
    delete req.query.cacheBust;
    qs = querystring.stringify(req.query);
    if(qs !== "") {
      qs = "?" + qs;
    }

    utils.createProject(config, user, project, function(err, status, project) {
      if(err) {
        if(status === 500) {
          res.sendStatus(500);
        } else {
          res.status(status).send({error: err});
        }
        return;
      }

      req.session.project = {};
      req.session.project.meta = project;
      req.session.project.root = utils.getProjectRoot(project);

      utils.persistProjectFiles(config, user, project, DefaultProject, function(err, status, files) {
        if(err) {
          if(status === 500) {
            res.sendStatus(500);
          } else {
            res.status(status).send({error: err});
          }
          return;
        }

        req.session.project.files = files;

        res.redirect(301, "/" + qs);
      });
    });
  };
};
