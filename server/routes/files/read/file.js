var utils = require("../../utils");

module.exports = function(config, req, res) {
  var fileId = req.params.fileId;
  var user = req.user;

  utils.sendResponseStream(res, utils.getProjectFile(config, user, fileId));
};
