var utils = require("./utils");

module.exports = function(config) {
  return function(req, res) {
    var project = JSON.parse(JSON.stringify(req.session.project.meta));
    var user = req.user;
    var getMetadata = utils.getProjectFileMetadata;
    var params = [config];

    if(!user && req.session.project.remixId) {
      getMetadata = utils.getRemixedProjectFileMetadata;
      params.push(req.session.project.remixId);
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
