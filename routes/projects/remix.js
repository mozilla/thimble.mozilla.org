var request = require("request");
var uuid = require("uuid");

module.exports = function(config, req, res) {
  var publishedId = req.params.publishedId;
  var user = req.user;
  if(!user) {
    res.redirect(307, "/anonymous/" + uuid.v4() + "/" + publishedId);
    return;
  }

  var now = req.query.now || (new Date()).toISOString();
  var options = {
    method: "PUT",
    uri: config.publishURL + "/publishedProjects/" + publishedId + "/remix?now=" + now,
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

    var project;
    try {
      project = JSON.parse(body);
    } catch(e) {
      console.error("Failed to parse remixed project with ", e.message, "\n at ", e.stack);
      res.sendStatus(500);
      return;
    }

    res.redirect(307, "/user/" + user.username + "/" + project.id);
  });
};
