var request = require("request");

module.exports = function(config) {
  return function(req, res) {
    if(!req.session.user) {
      res.redirect(301, '/');
      return;
    }

    var projectName = req.params.projectName;
    if(!projectName) {
      // TODO: handle error
      console.error('No project name specified');
      res.redirect(301, '/');
      return;
    }

    var cur = req.query.now || (new Date()).toISOString();
    var project = {
      title: projectName,
      user_id: req.session.publishUser.id,
      date_created: cur,
      date_updated: cur
    };

    request({
      method: 'POST',
      uri: config.publishURL + '/projects',
      headers: {
        "Authorization": "token " + config.cryptr.decrypt(req.session.token)
      },
      body: project,
      json: true
    }, function(err, response, body) {
      if(err) {
        // TODO: handle error
        console.error('Failed to send request to create new project');
        console.error(err);
        res.redirect(301, '/');
        return;
      }

      if(response.statusCode !== 200 && response.statusCode !== 201) {
        //TODO : handle error
        console.error('Failed to create new project: ', body);
        res.redirect(301, '/');
        return;
      }

      req.session.project = {};
      req.session.project.meta = body;
      req.session.project.files = {};
      req.session.project.isNew = true;
      req.session.redirectFromProjectSelection = true;

      res.redirect(301, '/');
    });
  };
};
