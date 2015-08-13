var request = require("request");
var uuid = require("uuid");

module.exports = function(config) {
  return function(req, res) {
    var projectId = req.params.projectId;
    var user = req.user;
    if(!user) {
      res.redirect("/" + uuid.v1() + "/" + projectId);
      return;
    }

    var now = req.query.now || (new Date()).toISOString();
    var options = {
      method: "PUT",
      uri: config.publishURL + "/publishedProjects/" + projectId + "/remix?now=" + now,
      headers: {
        "Authorization": "token " + user.token
      }
    };

    request(options, function(err, response, body) {
      if(err) {
        console.error("Failed to send request to " + options.uri + " with: ", err);
        res.sendStatus(500);
        return;
      }

      if(response.statusCode !== 200) {
        res.status(response.statusCode).send({error: response.body});
        return;
      }

      req.session.project = {
        meta: JSON.parse(body)
      };

      res.redirect(301, "/");
    });
  };
};
