define(function(require) {
  var $ = require("jquery"),
      BrambleUIBridge = require("fc/bramble-ui-bridge"),
      ProjectRenameUtility = require("fc/project-rename"),
      ProjectFiles = require("fc/load-project-files"),
      FileSystemSync = require("fc/filesystem-sync"),
      PathUtils = require("fc/path-utils");

  return function BrambleEditor(options) {
    var makeDetails = options.makeDetails;
    var host = options.appUrl;
    var authenticated = !!($("#publish-ssooverride").attr("data-oauth-username"));
    var csrfToken = $("meta[name='csrf-token']").attr("content");
    var projectNameComponent;

    var fileLoadingOptions = {
      authenticated: authenticated,
      csrfToken: csrfToken,
      persistenceURL: host + "/updateProjectFile",
      getFilesURL: host + "/initializeProject"
    };
    var fsync = FileSystemSync.init(authenticated, {
      createOrUpdate: host + "/updateProjectFile",
      del: host + "/deleteProjectFile"
    }, csrfToken);

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
        appUrl: host,
        authenticated: authenticated
      });
    });

    Bramble.on("error", function(err) {
      console.error("[Bramble Error]", err);
    });

    function mount(err, config) {
      if(err) {
        console.error("[Bramble Error]", err);
        return;
      }

      // Put a level of indirection between the project root and Bramble
      // so that moving or renaming the project files is painless (i.e.,
      // Bramble will only ever know about this symlink).
      PathUtils.createMountPoint(config.root, function(err, mountPoint) {
        if(err) {
          console.error("[Bramble Error] Unable to mount project directory");
          return;
        }

        // Stash the mountPoint on config in case we need to update it later.
        config.mountPoint = mountPoint;

        // Now that fs is setup, tell Bramble which root dir to mount
        // and which file within that root to open on startup.
        Bramble.mount(mountPoint, config.filePathToOpen);
      });
    }

    // Update the Project Title in the UI and allow it to be renamed
    projectNameComponent = new ProjectRenameUtility(host, authenticated, csrfToken, makeDetails.title);

    // Bramble: Load the project Files into the fs
    ProjectFiles.load(makeDetails, fileLoadingOptions, mount);
  };
});
