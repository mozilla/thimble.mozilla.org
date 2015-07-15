var utils = require("./utils");

module.exports = function(config) {
  return function(req, res) {
    var project = JSON.parse(JSON.stringify(req.session.project.meta));
    project.title = req.body.title;

    utils.updateProject(config, req.user.token, project, function(err, status, project) {
      if(err) {
        res.status(status).send({error: err});
        return;
      }

      if(status === 500) {
        res.sendStatus(500);
        return;
      }

      req.session.project.meta = project;
      req.session.project.root = utils.getProjectRoot(project);

      utils.updateCurrentProjectFiles(config, req.user.token, req.session, project, function(err, status) {
        if(err) {
          res.status(status).send({error: err});
          return;
        }

        res.sendStatus(status);
      });
    });
  };
};
