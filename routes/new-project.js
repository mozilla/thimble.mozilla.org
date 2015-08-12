var querystring = require("querystring");

var utils = require("./utils");
var Constants = require("../constants");
var defaultProject = require("../default");

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

      var defaultFiles = defaultProject.getAsStreams(config.DEFAULT_PROJECT_TITLE);
      utils.persistProjectFiles(config, user, project, defaultFiles, function(err, status) {
        if(err) {
          if(status === 500) {
            res.sendStatus(500);
          } else {
            res.status(status).send({error: err});
          }
          return;
        }

        res.redirect(301, "/" + qs);
      });
    });
  };
};
