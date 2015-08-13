var utils = require("./utils");

module.exports = function(config) {
  return function(req, res) {
    var user = req.user;
    var project = user ? req.session.project.meta : null;
    var remixId = req.params.remixId;
    var getMetadata = utils.getProjectFileMetadata;
    var params = [config];

    if(!user && remixId) {
      getMetadata = utils.getRemixedProjectFileMetadata;
      params.push(remixId);
    } else {
      params.push(user, project);
    }

    params.push(function(err, status, metadata) {
      if(err) {
        if(status === 500) {
          res.sendStatus(500);
        } else {
          res.status(status).send({error: err});
        }
        return;
      }

      res.status(200).send(metadata);
    });

    getMetadata.apply(null, params);
  };
};
