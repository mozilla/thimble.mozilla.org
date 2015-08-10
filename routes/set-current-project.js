var request = require("request");
var querystring = require("querystring");

module.exports = function(config) {
  return function(req, res) {
    // We do not want to propogate the `cacheBust` query parameter
    // that we use to fix the Firefox caching problem on the front-end
    if(req.query && req.query.cacheBust) {
      delete req.query.cacheBust;
    }

    var qs = querystring.stringify(req.query);
    if(qs !== "") {
      qs = "?" + qs;
    }
    var projectId = req.params.projectId;
    if(!projectId) {
      res.status(400).send({error: "No project ID specified"});
      return;
    }

    // Get project data from publish.wm.org
    request.get({
      url: config.publishURL + "/projects/" + projectId,
      headers: {
        "Authorization": "token " + req.user.token
      }
    }, function(err, response, body) {
      if(err) {
        res.status(500).send({error: err});
        return;
      }

      if(response.statusCode !== 200) {
        res.status(response.statusCode).send({error: response.body});
        return;
      }

      var project = JSON.parse(body);
      req.session.project = {};
      req.session.project.meta = project;

      res.redirect(301, "/" + qs);
    });
  };
};
