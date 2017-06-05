var utils = require("../../utils");
var HttpError = require("../../../lib/http-error");

module.exports = function(config, req, res, next) {
  var fileId = req.params.fileId;
  var user = req.user;

  utils.getProjectFile(config, user, fileId, function(err, buffer) {
    if(err) {
      res.status(500);
      next(HttpError.format(err, req));
      return;
    }

    res.status(200).send(buffer);
  });
};
