var request = require("request");
var querystring = require("querystring");
var utils = require("./utils");

module.exports = function(config) {
  return function(req, res) {
    var qs;
    var projectName = req.params.projectName;
    if(!projectName) {
      res.status(400).send({error: "No project name specified"});
      return;
    }

    var cur = req.query.now || (new Date()).toISOString();
    var project = {
      title: projectName,
      user_id: req.session.publishUser.id,
      date_created: cur,
      date_updated: cur
    };

    delete req.query.now;
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
      req.session.project.isNew = true;
      req.session.redirectFromProjectSelection = true;

      res.redirect(301, "/" + qs);
    });
  };
};
