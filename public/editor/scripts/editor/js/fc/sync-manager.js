/**
 * The SyncQueue keeps track of sync operations to be performed on paths.
 * This currently includes UPDATE and DELETE operations (create, update, delete
 * and rename are all done using these two). The data structure looks like this:
 *
 * syncQueue = {
 *   current: {
 *     path: "/path/to/file/being/synced",
 *     operation: "update"
 *   },
 *   pending: {
 *     "/path/to/file/needing/sync": "update",
 *     "/path/to/another/file/needing/sync": "delete",
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

define(function(require) {
  var $ = require("jquery");
  var EventEmitter = require("EventEmitter");
  var SYNC_OPERATION_UPDATE = require("constants").SYNC_OPERATION_UPDATE;
  var SYNC_OPERATION_DELETE = require("constants").SYNC_OPERATION_DELETE;
  var SYNC_TIMEOUT_MS = require("constants").SYNC_TIMEOUT_MS;
  var Project = require("project");
  var PathCache = require("PathCache");
  var logger = require("logger");

  // SyncManager instance
  var _instance;

  function bufferToFormData(path, buffer, dateUpdated) {
    dateUpdated = dateUpdated || (new Date()).toISOString();

    var formData = new FormData();
    formData.append("dateUpdated", dateUpdated);
    formData.append("bramblePath", Project.stripRoot(path));
    // Don't worry about actual mime type, just treat as binary
    var blob = new Blob([buffer], {type: "application/octet-stream"});
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

  // Start the autosync interval.
  SyncManager.prototype.start = function() {
    if(this._interval) {
      return;
    }
    this._interval = setInterval(this.sync.bind(this), SYNC_TIMEOUT_MS);
  };

  SyncManager.prototype.emitProgressEvent = function() {
    var pendingCount = this.pendingCount;

     // Emit either a `complete` event or a `pending` event depending on queue length.
    if(pendingCount === 0) {
      logger("SyncManager", "complete event");
      this.trigger("complete");
    } else {
      logger("SyncManager", "progress event - pending paths to sync:", pendingCount);
      this.trigger("progress", [pendingCount]);
    }
  };
  SyncManager.prototype.emitErrorEvent = function(err) {
    this.setSyncing(false);
    this.trigger("error", [err]);
    logger("SyncManager", "error event", err);

    // Try running the operation again, or the next one at least
    this.runNextOperation();
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
      processData: false
    };

    function send(id) {
      var request;

      if(id) {
        options.url = options.url + "/" + id;
      }

      request = $.ajax(options);
      request.done(function() {
        if(request.status !== 201 && request.status !== 200) {
          return callback(new Error("[Thimble] unable to persist `" + path + "`. Server responded with status " + request.status));
        }

        var data = request.responseJSON;
        Project.setFileID(path, data.id, callback);
      });
      request.fail(function(jqXHR, status, err) {
        logger("SyncManager", "unable to persist the file update to the server", err);
        callback(err);
      });
    }

    fs.readFile(path, function(err, data) {
      if(err) {
        return callback(err);
      }

      options.data = bufferToFormData(path, data);
      Project.getFileID(path, function(err, id) {
        if(err) {
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
        url: Project.getHost() + "/projects/" + Project.getID() + "/files/" + id + "?dateUpdated=" + (new Date()).toISOString(),
      });
      request.done(function() {
        if(request.status !== 200) {
          return callback(new Error("[Thimble] unable to persist `" + path + "`. Server responded with status " + request.status));
        }

        finish();
      });
      request.fail(function(jqXHR, status, err) {
        logger("SyncManager", "unable to persist the file delete to the server", err);
        callback(err);
      });
    }

    Project.getFileID(path, function(err, id) {
      if(err) {
        return callback(err);
      }

      // If the file hasn't been saved to the server yet (i.e., we have
      // no id for this file path), we're done and can just clean up and bail.
      if(!id) {
        logger("SyncManager", "skipping remote delete step, no file id for path", path);
        finish();
        return;
      }

      doDelete(id);
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

    self.setSyncing(true);

    function finalizeOperation(ajaxError) {
      Project.getSyncQueue(function(err, syncQueue) {
        if(err) {
          self.emitErrorEvent(err);
          return;
        }

        function finish() {
          // Operation synced successfully, remove it and save the SyncQueue.
          delete syncQueue.current;

          Project.setSyncQueue(syncQueue, function(err) {
            if(err) {
              self.emitErrorEvent(err);
              return;
            }

            self.setPendingCount(syncQueue);

            // If there are more files to sync, run the next one
            if(self.getPendingCount() > 0) {
              self.runNextOperation();
            } else {
              self.setSyncing(false);
            }
          });
        }

        function queueOperation() {
          if(currentOperation === SYNC_OPERATION_UPDATE) {
            Project.queueFileUpdate(currentPath);
          } else if(currentOperation === SYNC_OPERATION_DELETE) {
            Project.queueFileDelete(currentPath);
          } else {
            self.emitErrorEvent(new Error("[Thimble Error] unknown sync operation:" + currentOperation));
          }
        }

        // If the network operation errored, put this file operation back in the pending list
        if(ajaxError) {
          logger("SyncManager", "error syncing file, requeuing operation", ajaxError);
          queueOperation();
        }

        finish();
      });
    }

    function runCurrent() {
      logger("SyncManager", "starting sync", currentPath, currentOperation);

      if(currentOperation === SYNC_OPERATION_UPDATE) {
        self.updateOperation(currentPath, finalizeOperation);
      } else if(currentOperation === SYNC_OPERATION_DELETE) {
        self.deleteOperation(currentPath, finalizeOperation);
      } else {
        self.emitErrorEvent(new Error("[Thimble Error] unknown sync operation:" + currentOperation));
      }
      self.emitProgressEvent();
    }

    function selectCurrent(syncQueue) {
      // Add any cached operations to the queue, which have recently come in.
      syncQueue = PathCache.transferToSyncQueue(syncQueue);
      self.setPendingCount(syncQueue);

      // If there are no pending paths to sync, we're done.
      if(self.pendingCount === 0) {
        logger("SyncManager", "no pending sync operations, stopping syncing.");
        self.emitProgressEvent();
        self.setSyncing(false);
        return;
      }

      // Select and sync a path from the pending list
      var paths = Object.keys(syncQueue.pending);
      currentPath = paths[0];
      currentOperation = syncQueue.pending[currentPath];

      // Update current to the new path/operation, and remove from pending
      syncQueue.current = {
        path: currentPath,
        operation: currentOperation
      };
      delete syncQueue.pending[currentPath];

      // Persist this sync info to disk before going further so we can recover
      // if there's a crash or other failure.
      Project.setSyncQueue(syncQueue, function(err) {
        if(err) {
          self.emitErrorEvent(err);
          return;
        }

        self.setPendingCount(syncQueue);
        runCurrent();
      });
    }

    function pickCurrentOperation(err, syncQueue) {
      if(err) {
        self.emitErrorEvent(err);
        return;
      }

      self.setPendingCount(syncQueue);

      // If there's already a current operation in the queue, restart it
      // since it probably means the browser shutdown before it could complete.
      // Otherwise, pick a random file/opeartion to run.
      if(syncQueue.current) {
        currentPath = syncQueue.current.path;
        currentOperation = syncQueue.current.operation;
        logger("SyncManager", "restarting cached sync", currentPath, currentOperation);
        runCurrent();
      } else {
        selectCurrent(syncQueue);
      }
    }

    Project.getSyncQueue(pickCurrentOperation);
  };

  SyncManager.prototype.setSyncing = function(value) {
    // When we flip from not-syncing to syncing, emit an event
    if(!this.syncing && value) {
      logger("SyncManager", "start syncing");
      this.trigger("sync-start");
    }

    this.syncing = value;

    // Also tell interested users of SyncManager that we're starting/stopping
    // an AJAX sync for a particular file (vs. entire sync process).
    if(value) {
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
    if(this.isSyncing()) {
      return;
    }
    this.runNextOperation();
  };

  return SyncManager;
});
