/* globals $: true */
/**
 * The SyncQueue keeps track of sync operations to be performed on paths.
 * This currently includes UPDATE, DELETE and FOLDER_RENAME operations (
 * create, update, delete, rename and folder renames are all done using these two).
 * The data structure looks like this:
 *
 * syncQueue = {
 *   current: {
 *     path: "/path/to/file/being/synced",
 *     operation: "update"
 *   },
 *   pending: {
 *     "/path/to/file/needing/sync": "update",
 *     "/path/to/another/file/needing/sync": "delete",
 *     "/new/path/to/old/folder/which/was/renamed": {
 *       "operation": "folder-rename"
 *       "presistedPath": "/path/on/the/data/persistence/server"
 *       "changed": [ relativeFilePath1, relativeFilePath2, ... ]
 *     }
 *     ...
 *   }
 * }
 *
 * The `syncQueue.pending` object stores a backlog of paths and operations to be
 * synced. The `syncQueue.current` object is the file and operation currently being
 * done, or the one that was in process when the app was stopped/crashed/closed.
 *
 * The sync service picks a path at random from the `pending` list and moves it to
 * `current`, before saving this sync state. Then it tries to do what is in `current`
 * and if it works, it clears `current` and repeats the process.  If it fails, the
 * path and operation in current are moved back to pending, and the process repeats.
 *
 * In order to avoid races between the SyncManager and the editor's file update events,
 * a second data structure stores the latest path operations (i.e., events from editor):
 * the PathCache.  The PathCache needs to be transfered to the SyncQueue at regular
 * intervals.
 */

var $ = require("jquery");
var EventEmitter = require("wolfy87-eventemitter");

var Project = require("../project");
var PathCache = require("./path-cache");
var Backoff = require("./backoff");
var constants = require("../../../shared/scripts/constants");
var logger = require("../lib/logger");

var SYNC_OPERATION_UPDATE = constants.SYNC_OPERATION_UPDATE;
var SYNC_OPERATION_DELETE = constants.SYNC_OPERATION_DELETE;
var SYNC_OPERATION_FOLDER_RENAME = constants.SYNC_OPERATION_FOLDER_RENAME;
var AUTOSYNC_INTERVAL_MS = constants.AUTOSYNC_INTERVAL_MS;
var AJAX_DEFAULT_DELAY_MS = constants.AJAX_DEFAULT_DELAY_MS;
var AJAX_DEFAULT_TIMEOUT_MS = constants.AJAX_DEFAULT_TIMEOUT_MS;

// SyncManager instance
var _instance;

function bufferToFormData(path, buffer, dateUpdated) {
  dateUpdated = dateUpdated || new Date().toISOString();

  var formData = new FormData();
  formData.append("dateUpdated", dateUpdated);
  formData.append("bramblePath", Project.stripRoot(path));
  // Don't worry about actual mime type, just treat as binary
  var blob = new Blob([buffer], { type: "application/octet-stream" });
  formData.append("brambleFile", blob);

  return formData;
}

function SyncManager(csrfToken) {
  this.csrfToken = csrfToken;
  this.fs = Bramble.getFileSystem();

  // The number of file paths yet to be synced
  this.pendingCount = 0;

  // Whether or not we are currently syncing
  this.syncing = false;
}
SyncManager.prototype = new EventEmitter();
SyncManager.prototype.constructor = SyncManager;

SyncManager.init = function(csrfToken) {
  _instance = new SyncManager(csrfToken);
  return _instance;
};

SyncManager.getInstance = function() {
  return _instance;
};

// Start auto-syncing.
SyncManager.prototype.start = function() {
  if (this._interval) {
    return;
  }
  // Schedule future syncing
  this._interval = setInterval(this.sync.bind(this), AUTOSYNC_INTERVAL_MS);
  // And also do one now
  this.sync();
};

SyncManager.prototype.emitProgressEvent = function() {
  var pendingCount = this.pendingCount;

  logger(
    "SyncManager",
    "progress event - pending paths to sync:",
    pendingCount
  );
  this.trigger("progress", [pendingCount]);
};
SyncManager.prototype.emitCompleteEvent = function() {
  logger("SyncManager", "complete event");
  this.trigger("complete");
};
SyncManager.prototype.emitErrorEvent = function(err) {
  this.setSyncing(false);
  this.trigger("error", [err]);
  logger("SyncManager", "error event", err);
};

SyncManager.prototype.setPendingCount = function(syncQueue) {
  this.pendingCount = Object.keys(syncQueue.pending).length;
};
SyncManager.prototype.getPendingCount = function() {
  return this.pendingCount;
};

// Perform an AJAX update operation for a given path and file
SyncManager.prototype.updateOperation = function(path, callback) {
  var self = this;
  var csrfToken = self.csrfToken;
  var fs = self.fs;

  var options = {
    headers: {
      "X-Csrf-Token": csrfToken
    },
    type: "PUT",
    url: Project.getHost() + "/projects/" + Project.getID() + "/files",
    cache: false,
    contentType: false,
    processData: false,
    timeout: AJAX_DEFAULT_TIMEOUT_MS
  };

  function send(id) {
    var request;

    if (id) {
      options.url = options.url + "/" + id;
    }

    request = $.ajax(options);
    request.done(function() {
      if (request.status !== 201 && request.status !== 200) {
        return callback(
          new Error(
            "[Thimble] unable to persist `" +
              path +
              "`. Server responded with status " +
              request.status
          )
        );
      }

      var data = request.responseJSON;
      Project.setFileID(path, data.id, callback);
    });
    request.fail(function(jqXHR, status, err) {
      err = err || new Error("unknown network error during update operation");
      logger(
        "SyncManager",
        "unable to persist the file update to the server",
        err
      );
      callback(err);
    });
  }

  fs.readFile(path, function(err, data) {
    if (err) {
      // Deal with case of local file vanishing before we get a chance to sync (#2018).
      if (err.code === "ENOENT") {
        logger(
          "SyncManager",
          "local file missing for sync update operation, skipping: ",
          path
        );
        return callback();
      }
      return callback(err);
    }

    options.data = bufferToFormData(path, data);
    Project.getFileID(path, function(err, id) {
      if (err) {
        return callback(err);
      }
      send(id);
    });
  });
};

// Perform an AJAX delete operation for a given path and file
SyncManager.prototype.deleteOperation = function(path, callback) {
  var self = this;
  var csrfToken = self.csrfToken;

  function finish() {
    Project.removeFile(path, callback);
  }

  function doDelete(id) {
    var request = $.ajax({
      contentType: "application/json",
      headers: {
        "X-Csrf-Token": csrfToken
      },
      type: "DELETE",
      url:
        Project.getHost() +
        "/projects/" +
        Project.getID() +
        "/files/" +
        id +
        "?dateUpdated=" +
        new Date().toISOString(),
      timeout: AJAX_DEFAULT_TIMEOUT_MS
    });
    request.done(function() {
      if (request.status !== 200) {
        return callback(
          new Error(
            "[Thimble] unable to persist `" +
              path +
              "`. Server responded with status " +
              request.status
          )
        );
      }

      finish();
    });
    request.fail(function(jqXHR, status, err) {
      err = err || new Error("unknown network error during delete operation");
      logger(
        "SyncManager",
        "unable to persist the file delete to the server",
        err
      );
      callback(err);
    });
  }

  Project.getFileID(path, function(err, id) {
    if (err) {
      return callback(err);
    }

    // If the file hasn't been saved to the server yet (i.e., we have
    // no id for this file path), we're done and can just clean up and bail.
    if (!id) {
      logger(
        "SyncManager",
        "skipping remote delete step, no file id for path",
        path
      );
      finish();
      return;
    }

    doDelete(id);
  });
};

SyncManager.prototype.folderRenameOperation = function(
  newPath,
  renameInfo,
  callback
) {
  var self = this;
  var csrfToken = self.csrfToken;
  var oldPath = Project.stripRoot(renameInfo.persistedPath).replace(
    /\/?$/,
    "/"
  );
  newPath = Project.stripRoot(newPath).replace(/\/?$/, "/");
  var fileRenames = {};

  renameInfo.changed.forEach(function(relPath) {
    fileRenames[oldPath + relPath] = newPath + relPath;
  });

  var request = $.ajax({
    headers: {
      "X-Csrf-Token": csrfToken
    },
    type: "PUT",
    url: Project.getHost() + "/projects/" + Project.getID() + "/renamefolder",
    data: JSON.stringify({
      paths: fileRenames,
      dateUpdated: new Date().toISOString()
    }),
    cache: false,
    contentType: "application/json",
    timeout: AJAX_DEFAULT_TIMEOUT_MS
  });
  request.done(function() {
    if (request.status !== 200) {
      return callback(
        new Error(
          "[Thimble] unable to persist renaming `" +
            newPath +
            "`. Server responded with status " +
            request.status
        )
      );
    }

    callback();
  });
  request.fail(function(jqXHR, status, err) {
    err =
      err || new Error("unknown network error during folder rename operation");
    logger(
      "SyncManager",
      "unable to persist the folder rename to the server",
      err
    );
    callback(err);
  });
};

// Run an operation in the SyncQueue, and return the number of pending operations after it
// completes on the callback.  Throughout the process we work hard to keep the SyncQueue
// saved to disk. We also transfer anything in the PathCache into the SyncQueue, restart
// old syncs, re-queue failed operations, etc. in an effort to not lose any sync data.
SyncManager.prototype.runNextOperation = function() {
  var self = this;
  var currentPath;
  var currentOperation;
  var currentPathInfo;

  self.setSyncing(true);

  function finalizeOperation(operationErr) {
    Project.getSyncQueue(function(err, syncQueue) {
      if (err) {
        self.emitErrorEvent(err);
        return;
      }

      function finish() {
        // Current operation finished, remove it and save the SyncQueue.
        delete syncQueue.current;

        // Add any recent/failed (re-queued) operations to the queue
        syncQueue = PathCache.transferToSyncQueue(syncQueue);

        Project.setSyncQueue(syncQueue, function(err) {
          var delay;

          if (err) {
            self.emitErrorEvent(err);
            return;
          }

          self.setPendingCount(syncQueue);

          // If there are more files to sync, run the next one.
          if (self.getPendingCount() > 0) {
            self.emitProgressEvent();

            // If the last operation errored, apply a backoff delay.
            delay =
              (self.backoff && self.backoff.next()) || AJAX_DEFAULT_DELAY_MS;

            logger(
              "SyncManager",
              "finished current operation (" +
                (operationErr ? "failed" : "success") +
                "), will run next in " +
                delay +
                "ms. " +
                self.getPendingCount() +
                " operation(s) remain."
            );
            setTimeout(self.runNextOperation.bind(self), delay);
          } else {
            self.setSyncing(false);
            self.emitCompleteEvent();
          }
        });
      }

      function queueOperation() {
        if (currentOperation === SYNC_OPERATION_UPDATE) {
          Project.queueFileUpdate(currentPath);
        } else if (currentOperation === SYNC_OPERATION_DELETE) {
          Project.queueFileDelete(currentPath);
        } else if (currentOperation === SYNC_OPERATION_FOLDER_RENAME) {
          Project.queueFolderRename(
            {
              oldPath: currentPathInfo.persistedPath,
              newPath: currentPath,
              children: currentPathInfo.changed
            },
            true
          );
        } else {
          self.emitErrorEvent(
            new Error(
              "[Thimble Error] unknown sync operation:" + currentOperation
            )
          );
        }
      }

      // If the network operation errored, put this file operation back in the pending list
      // and create a backoff delay object.  If it worked, remove a previous backoff delay (if any).
      // Deal with any cases where the local file has vanished, and we should give up instead.
      if (operationErr) {
        logger(
          "SyncManager",
          "error syncing file: ",
          operationErr,
          "Requeuing operation: ",
          currentOperation,
          " for path",
          currentPath
        );
        self.trigger("file-sync-error");
        queueOperation();

        if (!self.backoff) {
          self.backoff = new Backoff();
        }
      } else {
        delete self.backoff;
      }

      finish();
    });
  }

  function runCurrent() {
    logger("SyncManager", "starting sync", currentPath, currentOperation);

    if (currentOperation === SYNC_OPERATION_UPDATE) {
      self.updateOperation(currentPath, finalizeOperation);
    } else if (currentOperation === SYNC_OPERATION_DELETE) {
      self.deleteOperation(currentPath, finalizeOperation);
    } else if (currentOperation === SYNC_OPERATION_FOLDER_RENAME) {
      self.folderRenameOperation(
        currentPath,
        currentPathInfo,
        finalizeOperation
      );
    } else {
      self.emitErrorEvent(
        new Error("[Thimble Error] unknown sync operation:" + currentOperation)
      );
    }
  }

  function selectPathToSync(queue) {
    var paths = Object.keys(queue);
    var selectedPath = paths[0];

    // Always prioritize a folder rename operation over other operations
    // Here we loop through the operations until we find an operation that
    // is a folder rename
    paths.every(function(queuedPath) {
      if (
        typeof queue[queuedPath] === "object" &&
        queue[queuedPath].operation === SYNC_OPERATION_FOLDER_RENAME
      ) {
        selectedPath = queuedPath;
        return false;
      }

      return true;
    });

    return selectedPath;
  }

  function selectCurrent(syncQueue) {
    // Add any cached operations to the queue, which have recently come in.
    syncQueue = PathCache.transferToSyncQueue(syncQueue);
    self.setPendingCount(syncQueue);

    // If there are no pending paths to sync, we're done.
    if (self.pendingCount === 0) {
      logger("SyncManager", "no pending sync operations, stopping syncing.");
      self.emitCompleteEvent();
      self.setSyncing(false);
      return;
    }

    // Select and sync a path from the pending list
    currentPath = selectPathToSync(syncQueue.pending);
    currentOperation =
      typeof syncQueue.pending[currentPath] === "object"
        ? syncQueue.pending[currentPath].operation
        : syncQueue.pending[currentPath];

    if (currentOperation === SYNC_OPERATION_FOLDER_RENAME) {
      currentPathInfo = {
        changed: syncQueue.pending[currentPath].changed,
        persistedPath: syncQueue.pending[currentPath].persistedPath
      };
    } else {
      currentPathInfo = null;
    }

    // Update current to the new path/operation, and remove from pending
    syncQueue.current = {
      path: currentPath,
      pathInfo: currentPathInfo,
      operation: currentOperation
    };

    delete syncQueue.pending[currentPath];

    // Persist this sync info to disk before going further so we can recover
    // if there's a crash or other failure.
    Project.setSyncQueue(syncQueue, function(err) {
      if (err) {
        self.emitErrorEvent(err);
        return;
      }

      self.setPendingCount(syncQueue);
      runCurrent();
    });
  }

  function pickCurrentOperation(err, syncQueue) {
    if (err) {
      self.emitErrorEvent(err);
      return;
    }

    self.setPendingCount(syncQueue);

    // If there's already a current operation in the queue, restart it
    // since it probably means the browser shutdown before it could complete.
    // Otherwise, select a random file/operation to run, prioritizing folder
    // renames first.
    if (syncQueue.current) {
      currentPath = syncQueue.current.path;
      currentOperation = syncQueue.current.operation;
      currentPathInfo = syncQueue.current.pathInfo;
      logger(
        "SyncManager",
        "restarting cached sync",
        currentPath,
        currentOperation
      );
      runCurrent();
    } else {
      selectCurrent(syncQueue);
    }
  }

  Project.getSyncQueue(pickCurrentOperation);
};

SyncManager.prototype.setSyncing = function(value) {
  // When we flip from not-syncing to syncing, emit an event
  if (!this.syncing && value) {
    logger("SyncManager", "start syncing");
    this.trigger("sync-start");
  }

  this.syncing = value;

  // Also tell interested users of SyncManager that we're starting/stopping
  // an AJAX sync for a particular file (vs. entire sync process).
  if (value) {
    this.trigger("file-sync-start");
  } else {
    this.trigger("file-sync-stop");
  }
};
SyncManager.prototype.isSyncing = function() {
  return !!this.syncing;
};
SyncManager.prototype.sync = function() {
  // If we're already in the process of syncing, bail
  if (this.isSyncing()) {
    return;
  }
  this.runNextOperation();
};

module.exports = SyncManager;
