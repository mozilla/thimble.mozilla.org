define(function(require) {
  var $ = require("jquery");
  var Project = require("project");
  var FileSystemSync = {};

  function hideFileState(remainingFiles) {
    if(!remainingFiles) {
      $("#navbar-save-indicator").addClass("hide");
    }
  }

  function triggerCallbacks(callbacks, args) {
    callbacks.forEach(function(callback) {
      callback.apply(null, args);
    });
  }

  function fileChange(csrfToken, fs, path, callback) {
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
          return callback(new Error("[Bramble] Server did not persist " + path + ". Server responded with status " + request.status));
        }

        var data = request.responseJSON;
        Project.setFileID(path, data.id, callback);
      });
      request.fail(function(jqXHR, status, err) {
        console.error("[Bramble] Failed to send request to persist the file to the server with: ", err);
        callback(err);
      });
    }

    fs.readFile(path, function(err, data) {
      if(err) {
        return callback(err);
      }

      options.data = FileSystemSync.toFormData(path, data);
      Project.getFileID(path, function(err, id) {
        if(err) {
          return callback(err);
        }
        send(id);
      });
    });
  }

  function handleFileChange(csrfToken, fs, path) {
    var context = this;
    context.queueLength++;

    fileChange(csrfToken, fs, path, function(err) {
      context.queueLength--;
      hideFileState(context.queueLength);
      triggerCallbacks(context._callbacks.afterEach, [err, path]);
    });
  }

  function fileDelete(csrfToken, fs, path, callback) {
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
          return callback(new Error("[Thimble] Server did not persist " + path + ". Server responded with status " + request.status));
        }

        Project.removeFile(path, callback);
      });
      request.fail(function(jqXHR, status, err) {
        console.error("[Thimble] Failed to send request to delete the file to the server with: ", err);
        callback(err);
      });
    }

    Project.getFileID(path, function(err, id) {
      if(err) {
        return callback(err);
      }

      doDelete(id);
    });
  }

  function handleFileDelete(csrfToken, fs, path) {
    var context = this;
    context.queueLength++;

    fileDelete(csrfToken, fs, path, function(err) {
      context.queueLength--;
      hideFileState(context.queueLength);
      triggerCallbacks(context._callbacks.afterEach, [err, path]);
    });
  }

  // Two part process (create + delete), which can be done in parallel
  function handleFileRename(csrfToken, fs, oldFilename, newFilename) {
    var context = this;

    // Step 1: Create the new file
    context.queueLength++;
    fileChange(csrfToken, fs, newFilename, function(err) {
      context.queueLength--;
      hideFileState(context.queueLength);
      triggerCallbacks(context._callbacks.afterEach, [err, newFilename]);
    });

    // Step 2: Delete the old file
    context.queueLength++;
    fileDelete(csrfToken, fs, oldFilename, function(err) {
      context.queueLength--;
      hideFileState(context.queueLength);
      triggerCallbacks(context._callbacks.afterEach, [err, oldFilename]);
    });
  }

  function FSync() {
    this.queueLength = 0;
    // Holds a list of callbacks that can be attached
    // using `fsync.addBeforeEachCallback` and `fsync.addAfterEachCallback`
    // and will run before and after (respectively) a file
    // change/delete/rename has been pushed up to the publish server.
    this._callbacks = {
      beforeEach: [],
      afterEach: []
    };
  }

  FileSystemSync.init = function(csrfToken) {
    // If an anonymous user is using thimble, they
    // will not have any persistence of files
    if(!Project.getUser()) {
      return null;
    }

    var fsync = new FSync();
    var fs = Bramble.getFileSystem();

    function configHandler(handler) {
      return function() {
        triggerCallbacks(fsync._callbacks.beforeEach, arguments);

        Array.prototype.unshift.call(arguments, csrfToken, fs);
        handler.apply(fsync, arguments);
      };
    }

    fsync.handlers = {
      change: configHandler(handleFileChange),
      del: configHandler(handleFileDelete),
      rename: configHandler(handleFileRename)
    };

    Bramble.once("ready", function(bramble) {
      fsync.bramble = bramble;

      bramble.on("fileChange", fsync.handlers.change);
      bramble.on("fileDelete", fsync.handlers.del);
      bramble.on("fileRename", fsync.handlers.rename);
    });

    return fsync;
  };

  /**
   * Static helper for construcitng a FormData object from file info.
   */
  FileSystemSync.toFormData = function(path, buffer, dateUpdated) {
    dateUpdated = dateUpdated || (new Date()).toISOString();

    var formData = new FormData();
    formData.append("dateUpdated", dateUpdated);
    formData.append("bramblePath", Project.stripRoot(path));
    // Don't worry about actual mime type, just treat as binary
    var blob = new Blob([buffer], {type: "application/octet-stream"});
    formData.append("brambleFile", blob);

    return formData;
  };

  FSync.prototype.saveAndSyncAll = function(callback) {
    var fsync = this;
    var bramble = fsync.bramble;
    var afterEach = fsync._callbacks.afterEach;
    var filesSaved = [];

    function resetAfterEach(fn) {
      var index = afterEach.indexOf(fn);
      if(index !== -1) {
        afterEach.splice(index, 1);
      }
    }

    function maybeFinish(err, path) {
      function finish() {
        resetAfterEach(maybeFinish);
        bramble.on("fileChange", fsync.handlers.change);
        callback.apply(null, arguments);
      }

      if(err) {
        finish(err, path);
        return;
      }

      if(path) {
        filesSaved.splice(filesSaved.indexOf(path), 1);
      }

      if(filesSaved.length === 0) {
        finish();
      }
    }

    function syncAll() {
      if(filesSaved.length === 0) {
        maybeFinish();
        return;
      }

      fsync.addAfterEachCallback(maybeFinish);
      filesSaved.forEach(function(path) {
        fsync.handlers.change(path);
      });
    }

    function cacheFilePaths(path) {
      filesSaved.push(path);
    }

    function maybeContinue(err) {
      if(err) {
        resetAfterEach(maybeContinue);
        callback(err);
        return;
      }

      if(fsync.queueLength > 0) {
        return;
      }

      resetAfterEach(maybeContinue);
      bramble.off("fileChange", fsync.handlers.change);
      bramble.on("fileChange", cacheFilePaths);

      bramble.saveAll(function() {
        bramble.off("fileChange", cacheFilePaths);
        syncAll();
      });
    }

    // If there are syncs queued up, wait on them
    if(fsync.queueLength > 0) {
      fsync.addAfterEachCallback(maybeContinue);
    } else {
      maybeContinue();
    }
  };

  // Add a callback to execute before every sync
  // Each callback receives a `path` as an argument
  FSync.prototype.addBeforeEachCallback = function(callback) {
    this._callbacks.beforeEach.push(callback);
  };

  FSync.prototype.removeBeforeEachCallback = function(callback) {
    var location = this._callbacks.beforeEach.indexOf(callback);

    if (location !== -1) {
      this._callbacks.beforeEach.splice(location, 1);
    }
  };

  // Add a callback to execute after every successful sync
  // Each callback receives `error` and `path` as arguments
  FSync.prototype.addAfterEachCallback = function(callback) {
    this._callbacks.afterEach.push(callback);
  };

  FSync.prototype.removeAfterEachCallback = function(callback) {
    var location = this._callbacks.afterEach.indexOf(callback);

    if (location !== -1) {
      this._callbacks.afterEach.splice(location, 1);
    }
  };

  return FileSystemSync;
});
