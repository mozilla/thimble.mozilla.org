define(function(require) {
  var $ = require("jquery"),
      BrambleUIBridge = require("fc/bramble-ui-bridge"),
      FileSystemSync = require("fc/filesystem-sync"),
      Project = require("project/project"),
      BrambleShim = require("BrambleShim");

  var csrfToken = $("meta[name='csrf-token']").attr("content");

  return {
    csrfToken: csrfToken,
    create: function(options) {
      FileSystemSync.init(csrfToken);

      // Start loading the Bramble editor resources
      Bramble.load("#webmaker-bramble",{
        url: options.editorUrl,
        hideUntilReady: true
      });

      // Start loading the project files
      Project.load(csrfToken, function(err, fileToOpen) {
        if(err) {
          console.error("[Thimble Error]", err);
          $("#spinner-container").addClass("loading-error");
          return;
        }

        // Now that fs is setup, tell Bramble which root dir to mount
        // and which file within that root to open on startup.
        Bramble.mount(Project.getRoot(), fileToOpen);
      });

      Bramble.once("ready", function(bramble) {
        // Make sure we don't crash trying to access new APIs not in Bramble's API
        // before we update the Service Worker cached version we're using.
        BrambleShim.shimAPI(bramble);

        // For debugging, attach to window.
        window.bramble = bramble;
        BrambleUIBridge.init(bramble, csrfToken, options.appUrl);
      });
    }
  };
});
