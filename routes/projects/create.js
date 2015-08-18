var querystring = require("querystring");

var utils = require("../utils");
var Constants = require("../../constants");
var defaultProject = require("../../default");

module.exports = function(config, req, res) {
  var qs;
  var user = req.user;
  var now = req.query.now || (new Date()).toISOString();
  var project = {
    title: Constants.DEFAULT_PROJECT_NAME,
    date_created: now,
    date_updated: now,
    user_id: user && user.publishId
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

      qs = qs === "" ? "?" : qs + "&";
      res.redirect(301, "/" + qs + "newProjectId=" + project.id);
    });
  });
};
