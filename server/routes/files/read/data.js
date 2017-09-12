var utils = require("../../utils");

module.exports = function(config, req, res) {
  var projectId = req.params.projectId;
  var user = req.user;

  // If this is an anonymous request and a `projectId` was passed in,
  // this is a request for getting files for a project that is
  // being remixed and the `projectId` corresponds to a published
  // project
  if (!user && projectId) {
    utils.sendResponseStream(
      res,
      utils.getRemixedProjectFileTar(config, projectId)
    );
    return;
  }

  utils.sendResponseStream(
    res,
    utils.getProjectFileTar(config, user, projectId)
  );
};
