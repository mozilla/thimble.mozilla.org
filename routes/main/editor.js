var url = require("url");
var querystring = require("querystring");

var env = require("../../lib/environment");
var Constants = require("../../constants");
var utils = require("../utils");

function getProjectMetadata(config, req, callback) {
  var project = req.project;
  var remixId = req.params.remixId;
  var anonymousId = req.params.anonymousId;

  if(project) {
    callback(null, {
      id: project.id,
      userID: req.user.publishId,
      anonymousId: project.anonymousId,
      remixId: project.remixId,
      title: project.title,
      dateCreated: project.date_created,
      dateUpdated: project.date_updated,
      tags: project.tags,
      description: project.description,
      publishUrl: project.publish_url
    });
    return;
  }

  if(!remixId) {
    callback(null, {
      anonymousId: anonymousId,
      title: Constants.DEFAULT_PROJECT_NAME,
    });
    return;
  }

  utils.getRemixedProject(config, remixId, function(err, status, project) {
    if(err) {
      callback(err);
      return;
    }

    callback(null, {
      anonymousId: anonymousId,
      remixId: remixId,
      title: project.title,
      description: project.description
    });
  });
}

module.exports = function(config, req, res) {
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
    queryString: qs,
    mainURL: env.get("NODE_ENV") === "development" ? "/editor/scripts/main.js" : "/dist/main.js"
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

    res.render("editor/index.html", options);
  });
};
