require.config({
  baseUrl: "/editor/scripts/editor/js",
  paths: {
    "text": "../vendor/require.text",
    "i18n": "../vendor/require.i18n",
    "sso-override": "../../sso-override",
    "jquery": "/bower/jquery/index",
    "localized": "/bower/webmaker-i18n/localized",
    "uuid": "/bower/node-uuid/uuid",
    "cookies": "/bower/cookies-js/dist/cookies",
    "project": "../../project/project",
    "constants": "../../constants"
  },
  shim: {
    "jquery": {
      exports: "$"
    }
  },
  config: {
    template: {
      htmlPath: "templates",
      i18nPath: "fc/nls/ui"
    }
  }
});

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

require(["bramble-editor", "project", "sso-override", "fc/project-rename"], init);
