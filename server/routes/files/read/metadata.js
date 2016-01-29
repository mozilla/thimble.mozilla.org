var utils = require("../../utils");

module.exports = function(config, req, res) {
  var user = req.user;
  var projectId = req.params.projectId;
  var getMetadata = utils.getProjectFileMetadata;
  var params = [config];

  if(!user && projectId) {
    getMetadata = utils.getRemixedProjectFileMetadata;
    params.push(projectId);
  } else {
    params.push(user, projectId);
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
