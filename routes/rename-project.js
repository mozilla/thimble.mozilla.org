var utils = require("./utils");

module.exports = function(config) {
  return function(req, res) {
    var project = JSON.parse(JSON.stringify(req.session.project.meta));
    project.title = req.body.title;

    utils.updateProject(config, req.user, project, function(err, status, project) {
      if(err) {
        if(status === 500) {
          res.sendStatus(500);
        } else {
          res.status(status).send({error: err});
        }
        return;
      }

      req.session.project.meta = project;

      res.sendStatus(200);
    });
  };
};
