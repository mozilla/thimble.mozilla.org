var url = require("url");
var querystring = require("querystring");

var Constants = require("../constants");
var utils = require("./utils");

function getProjectMetadata(config, req, callback) {
  var project = req.session.project && req.session.project.meta;
  var anonymousId = req.params.anonymousId;
  var remixId = req.params.remixId;
  var projectMetadata;

  if(project) {
    projectMetadata = {
      id: project.id,
      userID: req.session.publishUser.id,
      anonymousId: req.session.project.anonymousId,
      title: project.title,
      dateCreated: project.date_created,
      dateUpdated: project.date_updated,
      tags: project.tags,
      description: project.description,
      publishUrl: project.publish_url
    };
    delete req.session.project.anonymousId;

    callback(null, projectMetadata);
    return;
  }

  if(!remixId) {
    projectMetadata = {
      anonymousId: anonymousId,
      title: Constants.DEFAULT_PROJECT_NAME,
    };

    callback(null, projectMetadata);
    return;
  }

  utils.getRemixedProject(config, remixId, function(err, status, project) {
    if(err) {
      callback(err);
      return;
    }

    projectMetadata = {
      anonymousId: anonymousId,
      remixId: remixId,
      title: project.title,
      description: project.description
    };

    callback(null, projectMetadata);
  });
}

module.exports = function(config) {
  return function(req, res) {
    var qs = querystring.stringify(req.query);
    if(qs !== "") {
      qs = "?" + qs;
    }

    var options = {
      appURL: config.appURL,
      csrf: req.csrfToken(),
      editorHOST: config.editorHOST,
      loginURL: config.appURL + "/login",
      logoutURL: config.logoutURL,
      queryString: qs
    };

    // We add the localization code to the query params through a URL object
    // and set search prop to nothing forcing query to be used during url.format()
    var urlObj = url.parse(req.url, true);
    urlObj.search = "";
    urlObj.query.locale = req.localeInfo.lang;
    var thimbleUrl = url.format(urlObj);

    // We forward query string params down to the editor iframe so that
    // it's easy to do things like enableExtensions/disableExtensions
    options.editorURL = config.editorURL + "/index.html" + (url.parse(thimbleUrl).search || "");

    if (req.user) {
      options.username = req.user.username;
      options.avatar = req.user.avatar;
    }

    getProjectMetadata(config, req, function(err, projectMetadata) {
      if(err) {
        res.sendStatus(500);
        return;
      }

      options.projectMetadata = encodeURIComponent(JSON.stringify(projectMetadata));

      res.render("index.html", options);
    });
  };
};
