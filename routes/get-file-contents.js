var utils = require("./utils");

function sendResponse(res, tarStream) {
  res.type("application/x-tar");
  tarStream
  .on("error", function(err) {
    console.error("Failed to stream tar with: ", err);
  })
  .pipe(res);
}

module.exports = function(config) {
  return function(req, res) {
    var projectId = req.params.projectId;
    var user = req.user;

    // If this is an anonymous request and a `projectId` was passed in,
    // this is a request for getting files for a project that is
    // being remixed and the `projectId` corresponds to a published
    // project
    if(!user && projectId) {
      sendResponse(res, utils.getRemixedProjectFileTar(config, projectId));
      return;
    }

    sendResponse(res, utils.getProjectFileTar(config, user, projectId));
  };
};
