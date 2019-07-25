"use strict";

var moment = require("moment");
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
        if (config.shutdownNewProjectsAndPublishing) {
          res.redirect(
            307,
            `/${
              locale
            }/moving-to-glitch/#can-I-keep-using-thimble-until-I-export`
          );
        } else {
          // If there aren't any projects for this user, create one with a redirect
          res.redirect(307, "/" + locale + "/projects/new" + qs);
        }
        return;
      } else if (response.statusCode !== 200) {
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
        var g1 = project1.glitch_migrated,
          g2 = project2.glitch_migrated;

        // put "migrated already" at the end of the list
        if (g1 && !g2) {
          return 1;
        }
        if (g2 && !g1) {
          return -1;
        }

        // If both are already migrated, or they're both not
        // migrated, simply sort on when they were last updated.
        var t1 = new Date(project1.date_updated).getTime(),
          t2 = new Date(project2.date_updated).getTime();
        return t1 - t2;
      });

      // make sure the glitch move date is localized:
      moment.locale("en");
      var migrationDate = moment(config.glitch.migrationDate);
      migrationDate = migrationDate.locale(locale).format("LL");

      var options = {
        languages: req.app.locals.languages,
        URL_PATHNAME: "/projects" + qs,
        csrf: req.csrfToken ? req.csrfToken() : null,
        username: user.username,
        avatar: user.avatar,
        projects: projects,
        glitchExportEnabled: req.user && config.glitch.exportEnabled,
        glitch: req.user && config.glitch,
        migrationDate,
        queryString: qs,
        logoutURL: config.logoutURL,
        shutdownNewAccounts: config.shutdownNewAccounts,
        shutdownNewProjectsAndPublishing:
          config.shutdownNewProjectsAndPublishing
      };

      res.render("projects-list/index.html", options);
    }
  );
};
