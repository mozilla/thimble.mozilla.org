/* globals $: true */
var $ = require("jquery");

var startup = require("./lib/startup");
var analytics = require("../../shared/scripts/analytics");
var Project = require("./project");
var Editor = require("./editor");
var Login = require("./ui/login");
var ProjectRenameUtility = require("./ui/project-rename");

function load() {
  var thimbleScript = $("#thimble-script");
  var appUrl = thimbleScript.data("app-url");
  var projectDetails = thimbleScript.data("project-details");
  var editorUrl = thimbleScript.data("editor-url");

  // Unpack projectDetails details
  projectDetails = JSON.parse(decodeURIComponent(projectDetails));

  Project.init(projectDetails, appUrl, function(err) {
    if (err) {
      console.error("[Bramble] Failed to load Project state, with", err);
      analytics.exception(err, true);
    }

    // Initialize the name UI for an anonymous project
    if (!projectDetails.userID) {
      ProjectRenameUtility.init(appUrl, Editor.csrfToken);
    }

    // Initialize the login links
    Login.init();

    Editor.create({
      editorUrl: editorUrl,
      appUrl: appUrl
    });
  });
}

$(function() {
  startup.init(load);
});
