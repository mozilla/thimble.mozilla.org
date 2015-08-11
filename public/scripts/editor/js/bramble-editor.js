define(function(require) {
  var $ = require("jquery"),
      BrambleUIBridge = require("fc/bramble-ui-bridge"),
      ProjectRenameUtility = require("fc/project-rename"),
      FileSystemSync = require("fc/filesystem-sync"),
      SyncState = require("fc/sync-state"),
      Project = require("project");

  return function BrambleEditor(options) {
    var makeDetails = options.makeDetails;
    var host = options.appUrl;
    var authenticated = !!($("#publish-ssooverride").attr("data-oauth-username"));
    var csrfToken = $("meta[name='csrf-token']").attr("content");
    var projectNameComponent;

    var fsync = FileSystemSync.init(authenticated, {
      createOrUpdate: host + "/updateProjectFile",
      del: host + "/deleteProjectFile"
    }, csrfToken);

    // If the user is logged in, make it a bit harder to close while we're syncing
    if(authenticated) {
      fsync.addBeforeEachCallback(function() {
        SyncState.syncing();
      });

      fsync.addAfterEachCallback(function() {
        if(fsync.queueLength === 0) {
          SyncState.completed();
        }
      });
    }

    // Start loading the Bramble editor resources
    Bramble.load("#webmaker-bramble",{
      url: options.editorUrl
    });

    // Start loading the project files
    Project.load(makeDetails, host, authenticated, function(err, config) {
      if(err) {
        console.error("[Bramble Error]", err);
        return;
      }

      // Now that fs is setup, tell Bramble which root dir to mount
      // and which file within that root to open on startup.
      Bramble.mount(Project.getRoot(), config.open);
    });

    Bramble.once("ready", function(bramble) {
      // For debugging, attach to window.
      window.bramble = bramble;

      BrambleUIBridge.init(bramble, {
        sync: fsync,
        project: makeDetails,
        appUrl: host,
        authenticated: authenticated
      });
    });

    Bramble.on("error", function(err) {
      console.error("[Bramble Error]", err);
    });

    // Update the Project Title in the UI and allow it to be renamed
    // TODO: should this be in BrambleUIBradge or Project or a combo?  Seems wrong here.
    projectNameComponent = new ProjectRenameUtility(host, authenticated, csrfToken, makeDetails.title);
  };
});
