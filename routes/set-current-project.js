var request = require("request");

module.exports = function(config) {
  return function(req, res) {
    if(!req.session.user) {
      res.redirect(301, '/');
      return;
    }

    var projectId = req.params.projectId;
    if(!projectId) {
      // TODO: handle error
      console.error('No project ID specified');
      return;
    }

    // TODO: UI implementation (progress bar/spinner etc.)
    //       for blocking code
    // Get project data from publish.wm.org
    request.get({
      url: config.publishURL + '/projects/' + projectId,
      headers: {
        "Authorization": "token " + config.cryptr.decrypt(req.session.token)
      }
    }, function(err, response, body) {
      if(err) {
        // TODO: handle error
        console.error('Failed to get project info');
        return;
      }

      if(response.statusCode !== 200) {
        // TODO: handle error
        console.error('Error retrieving user\'s projects: ', response.body);
        return;
      }

      req.session.project = {};
      req.session.project.meta = JSON.parse(body);
      req.session.redirectFromProjectSelection = true;

      res.redirect(301, '/');
    });
  };
};
