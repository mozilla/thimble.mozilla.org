define(function(require) {
  var $ = require("jquery"),
      BrambleUIBridge = require("fc/bramble-ui-bridge"),
      FileSystemSync = require("fc/filesystem-sync"),
      SyncState = require("fc/sync-state"),
      Project = require("project");

  var csrfToken = $("meta[name='csrf-token']").attr("content");

  return {
    csrfToken: csrfToken,
    create: function(options) {
      var fsync = FileSystemSync.init(csrfToken);

      // If the user is logged in, make it a bit harder to close while we're syncing
      if(Project.getUser()) {
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
        url: options.editorUrl,
        autoRecoverFileSystem: true
      });

      // Start loading the project files
      Project.load(fsync, csrfToken, function(err, fileToOpen) {
        if(err) {
          console.error("[Thimble Error]", err);
          return;
        }

        // Now that fs is setup, tell Bramble which root dir to mount
        // and which file within that root to open on startup.
        Bramble.mount(Project.getRoot(), fileToOpen);
      });

      Bramble.once("ready", function(bramble) {
        // For debugging, attach to window.
        window.bramble = bramble;

        BrambleUIBridge.init(bramble, { sync: fsync });
      });

      Bramble.on("error", function(err) {
        console.error("[Bramble Error]", err);
      });
    }
  };
});
