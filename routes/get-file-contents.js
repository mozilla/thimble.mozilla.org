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
    var project = JSON.parse(JSON.stringify(req.session.project.meta));
    var user = req.user;

    if(!user && req.session.project.remixId) {
      sendResponse(res, utils.getRemixedProjectFileTar(config, req.session.project.remixId));
      return;
    }

    sendResponse(res, utils.getProjectFileTar(config, user, project));
  };
};
