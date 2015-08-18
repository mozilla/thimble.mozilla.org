var utils = require("../utils");

module.exports = function(config, req, res) {
  req.project.title = req.body.title;

  utils.updateProject(config, req.user, req.project, function(err, status) {
    if(err) {
      if(status === 500) {
        res.sendStatus(500);
      } else {
        res.status(status).send({error: err});
      }
      return;
    }

    res.sendStatus(200);
  });
};
