"use strict";

var request = require("request");
var querystring = require("querystring");

var HttpError = require("../../lib/http-error");

module.exports = function(config, req, res, next) {
  var publishURL = config.publishURL;
  var user = req.user;
  var readURL = publishURL + "/users/" + user.publishId + "/projects";
  var locale =
    req.localeInfo && req.localeInfo.lang ? req.localeInfo.lang : "en-US";
  var qs = querystring.stringify(req.query);
  if (qs !== "") {
    qs = "?" + qs;
  }

  request.get(
    {
      url: readURL,
      headers: {
        Authorization: "token " + user.token
      }
    },
    function(err, response, body) {
      res.set({
        "Cache-Control": "no-cache"
      });

      if (err) {
        res.status(500);
        next(
          HttpError.format(
            {
              message: "Failed to send request to " + readURL,
              context: err
            },
            req
          )
        );
        return;
      }

      if (response.statusCode === 404) {
        // If there aren't any projects for this user, create one with a redirect
        res.redirect(307, "/" + locale + "/projects/new" + qs);
        return;
      }

      if (response.statusCode !== 200) {
        res.status(response.statusCode);
        next(
          HttpError.format(
            {
              message:
                "Request to " +
                readURL +
                " returned a status of " +
                response.statusCode,
              context: response.body
            },
            req
          )
        );
        return;
      }

      var projects;
      try {
        projects = JSON.parse(body);
      } catch (e) {
        res.status(500);
        next(
          HttpError.format(
            {
              message:
                "Project sent by calling function was in an invalid format. Failed to run `JSON.parse`",
              context: e.message,
              stack: e.stack
            },
            req
          )
        );
        return;
      }

      //Sort projects in ascending order by last updated
      projects.sort(function(project1, project2) {
        return (
          new Date(project2.date_updated).getTime() -
          new Date(project1.date_updated).getTime()
        );
      });

      var options = {
        languages: req.app.locals.languages,
        URL_PATHNAME: "/projects" + qs,
        csrf: req.csrfToken ? req.csrfToken() : null,
        username: user.username,
        avatar: user.avatar,
        projects: projects,
        queryString: qs,
        logoutURL: config.logoutURL
      };

      res.render("projects-list/index.html", options);
    }
  );
};
