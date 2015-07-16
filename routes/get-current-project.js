var utils = require("./utils");

module.exports = function(config) {
  return function(req, res) {
    var project = req.session.project.meta;

    utils.updateCurrentProjectFiles(config, req.user.token, req.session, project, function(err, status, files) {
      if(err) {
        res.status(status).send({error: err});
        return;
      }

      if(status === 500) {
        res.sendStatus(500);
        return;
      }

      res.type("application/json");
      res.send({
        project: project,
        files: files
      });
    });
  };
};
