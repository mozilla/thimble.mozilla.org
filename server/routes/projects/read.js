var request = require("request");
var querystring = require("querystring");

module.exports = function(config, req, res) {
  var publishURL = config.publishURL;
  var user = req.user;
  var locale = (req.localeInfo && req.localeInfo.lang) ? req.localeInfo.lang : "en-US";
  var qs = querystring.stringify(req.query);
  if(qs !== "") {
    qs = "?" + qs;
  }

  request.get({
    url: publishURL + "/users/" + user.publishId + "/projects",
    headers: {
      "Authorization": "token " + user.token
    }
  }, function(err, response, body) {
    if(err) {
      res.status(500).send({error: err});
      return;
    }

    res.set({
      "Cache-Control": "no-cache"
    });

    if(response.statusCode === 404) {
      // If there aren't any projects for this user, create one with a redirect
      res.redirect(301, "/" + locale + "/projects/new" + qs);
      return;
    }

    if(response.statusCode !== 200) {
      res.status(response.statusCode).send({error: response.body});
      return;
    }

    var projects;
    try {
      projects = JSON.parse(body);
    } catch(e) {
      console.error("Failed to parse user's projects with ", e.message, "\n at ", e.stack);
      res.sendStatus(500);
      return;
    }

    //Sort projects in ascending order by last updated
    projects.sort(function(project1, project2) {
        return new Date(project2.date_updated).getTime() - new Date(project1.date_updated).getTime();
    });

    var options = {
      languages: req.app.locals.languages,
      URL_PATHNAME: "/projects" + qs,
      csrf: req.csrfToken ? req.csrfToken() : null,
      HTTP_STATIC_URL: "/" + locale,
      username: user.username,
      avatar : user.avatar,
      projects: projects,
      editorHOST: config.editorHOST,
      logoutURL : config.logoutURL
    };

    res.render("editor/projects.html", options);
  });
};
