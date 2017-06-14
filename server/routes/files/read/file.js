var utils = require("../../utils");
var HttpError = require("../../../lib/http-error");

module.exports = function(config, req, res) {
  var fileId = req.params.fileId;
  var user = req.user;

  utils.sendResponseStream(res, utils.getProjectFile(config, user, fileId));
};
