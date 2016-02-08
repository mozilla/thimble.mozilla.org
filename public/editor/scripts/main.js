// NOTE: if you change this, update Gruntfile's requirejs:dist task too
require.config({
  waitSeconds: 120,
  baseUrl: "/{{ locale }}/editor/scripts/editor/js",
  paths: {
    // Folders
    "project": "../../project",

    // Files
    "bowser": "/scripts/vendor/bowser",
    "sso-override": "../../sso-override",
    "logger": "../../logger",
    "jquery": "/bower/jquery/index",
    "localized": "/bower/webmaker-i18n/localized",
    "uuid": "/bower/node-uuid/uuid",
    "cookies": "/bower/cookies-js/dist/cookies",
    "PathCache": "../../path-cache",
    "constants": "../../constants",
    "EventEmitter": "/bower/eventEmitter/EventEmitter.min",
    "analytics": "/bower/webmaker-analytics/analytics"
  },
  shim: {
    "jquery": {
      exports: "$"
    }
  }
});

require(["jquery", "bowser"], function($, bowser) {
  // Warn users of unsupported browsers that they can try something newer,
  // specifically anything before IE 11 or Safari 8.
  if((bowser.msie && bowser.version < 11) || (bowser.safari && bowser.version < 8)) {
    $("#browser-support-warning").removeClass("hide");

    $(".let-me-in").on("click", function() {
      $("#browser-support-warning").fadeOut();
      return false;
    });
  }

  function onError(err) {
    console.error("[Bramble Error]", err);
    $("#spinner-container").addClass("loading-error");
  }

  // If Bramble fails to load (some browser loading issues cause it to fail),
  // error out now, since we won't get to Bramble.on('error', ...)
  if(!window.Bramble) {
    onError(new Error("Unable to load Bramble editor in this browser"));
    return;
  }

  Bramble.once("error", onError);

  function init(BrambleEditor, Project, SSOOverride, ProjectRenameUtility) {
    var thimbleScript = document.getElementById("thimble-script");
    var appUrl = thimbleScript.getAttribute("data-app-url");
    var projectDetails = thimbleScript.getAttribute("data-project-details");
    var editorUrl = thimbleScript.getAttribute("data-editor-url");

    // Unpack projectDetails details
    projectDetails = JSON.parse(decodeURIComponent(projectDetails));

    Project.init(projectDetails, appUrl, function(err) {
      if (err) {
        console.error("[Bramble] Failed to load Project state, with", err);
      }

      // Initialize the project name UI
      ProjectRenameUtility.init(appUrl, BrambleEditor.csrfToken);

      // Initialize the login links
      SSOOverride.init();

      BrambleEditor.create({
        editorUrl: editorUrl,
        appUrl: appUrl
      });
    });
  }

  require(["bramble-editor", "project/project", "sso-override", "fc/project-rename"], init);
});
