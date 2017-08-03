// NOTE: if you change this, update Gruntfile's requirejs:dist task too
require.config({
  waitSeconds: 120,
  baseUrl: "/{{ locale }}/editor/scripts",
  paths: {
    "bowser": "/scripts/vendor/bowser",
    "jquery": "/node_modules/jquery/dist/jquery.min",
    "localized": "/node_modules/webmaker-i18n/localized",
    "uuid": "/node_modules/node-uuid/uuid",
    "cookies": "/node_modules/cookies-js/dist/cookies",
    "constants": "/{{ locale }}/shared/scripts/constants",
    "EventEmitter": "/node_modules/wolfy87-eventemitter/EventEmitter.min",
    "analytics": "/{{ locale }}/shared/scripts/analytics"
  },
  shim: {
    "jquery": {
      exports: "$"
    }
  }
});

require(["lib/startup"], function(Startup) {

  function init(Editor, Project, Login, ProjectRenameUtility, analytics) {
    var thimbleScript = document.getElementById("thimble-script");
    var appUrl = thimbleScript.getAttribute("data-app-url");
    var projectDetails = thimbleScript.getAttribute("data-project-details");
    var editorUrl = thimbleScript.getAttribute("data-editor-url");

    // Unpack projectDetails details
    projectDetails = JSON.parse(decodeURIComponent(projectDetails));

    Project.init(projectDetails, appUrl, function(err) {
      if (err) {
        console.error("[Bramble] Failed to load Project state, with", err);
        analytics.exception(err, true);
      }

      // Initialize the name UI for an anonymous project
      if(!projectDetails.userID){
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

  Startup.init(function start() {
    require(["editor", "project/index", "ui/login", "ui/project-rename", "analytics"], init);
  });
});
