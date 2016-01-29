var utils = require("../utils");

module.exports = function(config, req, res) {
  var user = req.user;
  var project = req.project;

  project.title = req.body.title;
  project.description = req.body.description;
  project.date_created = req.body.dateCreated;
  project.date_updated = req.body.dateUpdated;
  project.user_id = user.publishId;

  utils.updateProject(config, user, project, function(err, status, project) {
    if(err) {
      if(status === 500) {
        res.sendStatus(500);
      } else {
        res.status(status).send({error: err});
      }
      return;
    }

    res.status(status).send(project);
  });
};
