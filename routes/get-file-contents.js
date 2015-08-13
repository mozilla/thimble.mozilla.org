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
    var remixId = req.params.remixId;
    var user = req.user;
    var project = user ? req.session.project.meta : null;

    if(!user && remixId) {
      sendResponse(res, utils.getRemixedProjectFileTar(config, remixId));
      return;
    }

    sendResponse(res, utils.getProjectFileTar(config, user, project));
  };
};
