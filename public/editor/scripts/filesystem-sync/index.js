/* globals $: true */
/**
 * The FileSystemSync module connects the Bramble editor's file system change events
 * to the PathCache and SyncManager, making sure that all changes to local files
 * get recorded and eventually sent to the server.
 */
var $ = require("jquery");
var strings = require("strings");

var Project = require("../project");
var SyncManager = require("./manager");
var SyncState = require("./state");

var syncManager;
var brambleInstance;

function saveAndSyncAll(callback) {
  if (!(brambleInstance && syncManager)) {
    callback(
      new Error("[Thimble Error] saveAndSyncAll() called before init()")
    );
    return;
  }

  brambleInstance.saveAll(function() {
    syncManager.once("complete", callback);
    syncManager.sync();
  });
}

function init(csrfToken) {
  // If an anonymous user is using thimble, they
  // will not have any persistence of files
  if (!Project.getUser()) {
    return null;
  }

  syncManager = SyncManager.init(csrfToken);

  // Update the UI with a "Saving..." indicator whenever we sync a file
  syncManager.on("file-sync-start", function() {
    $("#navbar-save-indicator").removeClass("hide");
    $("#navbar-save-indicator").text(strings.get("fileSavingIndicator"));
  });
  syncManager.on("file-sync-stop", function() {
    $("#navbar-save-indicator").addClass("hide");
  });
  syncManager.on("file-sync-error", function() {
    // Saving over the network failed, let the user know, and that we'll retry
    $("#navbar-save-indicator").text(strings.get("fileSavingFailedIndicator"));
  });

  // Warn the user when we're syncing so they don't close the window by accident
  syncManager.on("sync-start", function() {
    SyncState.syncing();
  });
  syncManager.on("complete", function() {
    SyncState.completed();
  });

  Bramble.once("ready", function(bramble) {
    function handleFileChange(path) {
      Project.queueFileUpdate(path);
    }

    function handleFileDelete(path) {
      Project.queueFileDelete(path);
    }

    function handleFileRename(oldFilename, newFilename) {
      // Step 1: Create the new file
      Project.queueFileUpdate(newFilename);
      // Step 2: Delete the old file
      Project.queueFileDelete(oldFilename);
    }

    function handleFolderRename(paths) {
      Project.queueFolderRename(paths);
    }

    bramble.on("fileChange", handleFileChange);
    bramble.on("fileDelete", handleFileDelete);
    bramble.on("fileRename", handleFileRename);
    bramble.on("folderRename", handleFolderRename);

    // Begin autosyncing
    syncManager.start();

    brambleInstance = bramble;
  });
}

module.exports = {
  init: init,
  saveAndSyncAll: saveAndSyncAll
};
