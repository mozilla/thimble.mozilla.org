/**
 * The FileSystemSync module connects the Bramble editor's file system change events
 * to the PathCache and SyncManager, making sure that all changes to local files
 * get recorded and eventually sent to the server.
 */

define(function(require) {
  var $ = require("jquery");
  var Project = require("project/project");
  var SyncManager = require("fc/sync-manager");
  var SyncState = require("fc/sync-state");

  var syncManager;
  var brambleInstance;

  function saveAndSyncAll(callback) {
    if(!(brambleInstance && syncManager)) {
      callback(new Error("[Thimble Error] saveAndSyncAll() called before init()"));
      return;
    }

    brambleInstance.saveAll(function() {
      syncManager.once("complete", callback);
      syncManager.sync();
    });
  }

  function useOfflineSaveIndicators() {
    Bramble.once("ready", function(bramble) {
      bramble.on("projectDirty", function(){
        $("#navbar-saved-offline-indicator").addClass("hide");
        $("#navbar-save-indicator").removeClass("hide");
      });

      bramble.on("projectSaved", function(){
        $("#navbar-save-indicator").addClass("hide");
        $("#navbar-saved-offline-indicator").removeClass("hide");
      });
    });
  }

  function init(csrfToken) {
    // If an anonymous user is using Thimble, we won't persist files
    // to the server.  Show offline saving info instead.
    if(!Project.getUser()) {
      useOfflineSaveIndicators();
      return null;
    }

    syncManager = SyncManager.init(csrfToken);

    // Update the UI with a "Saving..." indicator whenever we sync a file
    syncManager.on("file-sync-start", function() {
      $("#navbar-saved-indicator").addClass("hide");
      $("#navbar-saved-offline-indicator").addClass("hide");

      $("#navbar-save-indicator").removeClass("hide");
      $("#navbar-save-indicator").text("{{ fileSavingIndicator }}");
    });
    syncManager.on("file-sync-stop", function() {
      $("#navbar-saved-offline-indicator").addClass("hide");
      $("#navbar-save-indicator").addClass("hide");

      $("#navbar-saved-indicator").removeClass("hide");
    });
    syncManager.on("file-sync-error", function() {
      $("#navbar-saved-indicator").addClass("hide");
      $("#navbar-saved-offline-indicator").addClass("hide");

      // Saving over the network failed, let the user know, and that we'll retry
      $("#navbar-save-indicator").text("{{ fileSavingFailedIndicator }}");
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

      // Also show offline saving indicators, in addition to server sync
      bramble.on("projectDirty", function(){
        $("#navbar-saved-indicator").addClass("hide");
        $("#navbar-saved-offline-indicator").addClass("hide");

        $("#navbar-save-indicator").removeClass("hide");
      });

      bramble.on("projectSaved", function(){
        $("#navbar-saved-indicator").addClass("hide");
        $("#navbar-save-indicator").addClass("hide");

        $("#navbar-saved-offline-indicator").removeClass("hide");
      });

      brambleInstance = bramble;
    });
  }

  return {
    init: init,
    saveAndSyncAll: saveAndSyncAll
  };
});
