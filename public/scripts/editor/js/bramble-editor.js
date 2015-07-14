define(function(require) {
  var $ = require("jquery"),
      BrambleUIBridge = require("fc/bramble-ui-bridge"),
      ProjectUI = require("fc/bramble-project"),
      ProjectFiles = require("fc/load-project-files"),
      FileSystemSync = require("fc/filesystem-sync");

  return function BrambleEditor(options) {
    var makeDetails = options.makeDetails,
        username = $("#ssooverride").attr("data-oauth-username");

    ProjectUI.updateMeta(makeDetails);

    var fsync = FileSystemSync.init(makeDetails && makeDetails.title, {
      createOrUpdate: options.appUrl + "/updateProjectFile",
      del: options.appUrl + "/deleteProjectFile"
    }, $("meta[name='csrf-token']").attr("content"));

    // Start loading Bramble
    Bramble.load("#webmaker-bramble",{
      url: options.editorUrl
    });

    // Event listeners
    Bramble.once("ready", function(bramble) {
      // For debugging, attach to window.
      window.bramble = bramble;
      BrambleUIBridge.init(bramble, {
        sync: fsync,
        project: makeDetails,
        appUrl: options.appUrl,
        authenticated: !!username
      });
    });

    Bramble.on("error", function(err) {
      console.error("[Bramble Error]", err);
    });

    // Bramble: Load the project Files into the fs
    function initFs(callback) {
      if(!makeDetails || !makeDetails.title) {
        makeDetails = ProjectFiles.generateDefaultProject();
        ProjectFiles.load(makeDetails, {}, callback);
        return;
      }

      if(makeDetails.isNew) {
        makeDetails = ProjectFiles.generateDefaultProject(makeDetails.title);
        ProjectFiles.load(makeDetails, {
          isNew: true,
          csrfToken: $("meta[name='csrf-token']").attr("content"),
          persistenceURL: options.appUrl + "/updateProjectFile"
        }, callback);
        return;
      }

      ProjectFiles.load(makeDetails, callback);
    }

    initFs(function(err, config) {
      if(err) {
        console.error("[Bramble Error]", err);
        return;
      }

      // Now that fs is setup, tell Bramble which root dir to mount
      // and which file within that root to open on startup.
      Bramble.mount(config.root, config.open);
    });
  };
});
