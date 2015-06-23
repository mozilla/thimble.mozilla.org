var request = require("request");

module.exports = function(config) {
  return function(req, res) {
    var projectId = req.params.projectId;
    if(!projectId) {
      res.send(400, { error: "No project ID specified" });
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
        res.send(500, { error: err });
        return;
      }

      if(response.statusCode !== 200) {
        res.send(response.statusCode, { error: response.body });
        return;
      }

      req.session.project = {};
      req.session.project.meta = JSON.parse(body);
      req.session.redirectFromProjectSelection = true;

      res.redirect(301, "/");
    });
  };
};
