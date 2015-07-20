var request = require("request");
var querystring = require("querystring");
var utils = require("./utils");
var Constants = require("../constants");

module.exports = function(config) {
  return function(req, res) {
    var qs;
    var now = req.query.now || (new Date()).toISOString();
    var project = {
      title: Constants.DEFAULT_PROJECT_NAME,
      user_id: req.session.publishUser.id,
      date_created: now,
      date_updated: now
    };

    delete req.query.now;
    delete req.query.cacheBust;
    qs = querystring.stringify(req.query);
    if(qs !== "") {
      qs = "?" + qs;
    }

    request({
      method: "POST",
      uri: config.publishURL + "/projects",
      headers: {
        "Authorization": "token " + req.user.token
      },
      body: project,
      json: true
    }, function(err, response, body) {
      if(err) {
        res.status(500).send({error: err});
        return;
      }

      if(response.statusCode !== 200 && response.statusCode !== 201) {
        res.status(500).send({error: response.body});
        return;
      }

      req.session.project = {};
      req.session.project.meta = body;
      req.session.project.root = utils.getProjectRoot(body);
      req.session.project.files = {};
      req.session.project.createTemplate = true;
      req.session.redirectFromProjectSelection = true;

      res.redirect(301, "/" + qs);
    });
  };
};
