define(["jquery"], function($) {
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

  function pushFileChange(url, csrfToken, fs, path) {
    var context = this;
    var options = {
      contentType: "application/json",
      headers: {
        "X-Csrf-Token": csrfToken
      },
      type: "PUT",
      url: url
    };

    function send() {
      var error;
      var request = $.ajax(options);
      request.done(function() {
        if(request.status !== 201 && request.status !== 200) {
          error = request.body;
          console.error("[Bramble] Server did not persist ", path, ". Server responded with status ", request.status);
        }
      });
      request.fail(function(jqXHR, status, err) {
        error = err;
        console.error("[Bramble] Failed to send request to persist the file to the server with: ", err);
      });
      request.always(function() {
        context.queueLength--;
        hideFileState(context.queueLength);
        triggerCallbacks(context._callbacks.afterEach, [error, path]);
      });
    }

    fs.readFile(path, function(err, data) {
      if(err) {
        context.queueLength--;
        console.error("[Bramble] Failed to read ", path, " with ", err);
        triggerCallbacks(context._callbacks.afterEach, [err, path]);
        return;
      }

      options.data = JSON.stringify({
        path: path,
        buffer: data,
        dateUpdated: (new Date()).toISOString()
      });

      send();
    });
  }

  function pushFileDelete(url, csrfToken, fs, path) {
    var context = this;
    var error;
    var request = $.ajax({
      contentType: "application/json",
      headers: {
        "X-Csrf-Token": csrfToken
      },
      type: "PUT",
      url: url,
      data: JSON.stringify({
        path: path,
        dateUpdated: (new Date()).toISOString()
      })
    });
    request.done(function() {
      if(request.status !== 200) {
        error = request.body;
        console.error("[Bramble] Server did not persist ", path, ". Server responded with status ", request.status);
      }
    });
    request.fail(function(jqXHR, status, err) {
      error = err;
      console.error("[Bramble] Failed to send request to delete the file to the server with: ", err);
    });
    request.always(function() {
      context.queueLength--;
      hideFileState(context.queueLength);
      triggerCallbacks(context._callbacks.afterEach, [error, path]);
    });
  }

  function pushFileRename() {}

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

  FileSystemSync.init = function(projectName, persistanceUrls, csrfToken) {
    // If no project name was provided, then an anonymous user is using thimble
    // and will not have any persistence of files
    if(!projectName) {
      return null;
    }

    var fsync = new FSync();
    var fs = Bramble.getFileSystem();

    function configHandler(handler, url) {
      return function() {
        triggerCallbacks(fsync._callbacks.beforeEach, arguments);

        Array.prototype.unshift.call(arguments, url, csrfToken, fs);
        handler.apply(fsync, arguments);
      };
    }
    Bramble.once("ready", function(bramble) {
      fsync.bramble = bramble;
      fsync.handlers = {
        change: configHandler(pushFileChange, persistanceUrls.createOrUpdate),
        del: configHandler(pushFileDelete, persistanceUrls.del),
        rename: configHandler(pushFileRename, persistanceUrls.rename)
      };

      bramble.on("fileChange", fsync.handlers.change);
      bramble.on("fileDelete", fsync.handlers.del);
      bramble.on("fileRename", fsync.handlers.rename);
    });

    return fsync;
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

  // Add a callback to execute after every successful sync
  // Each callback receives `error` and `path` as arguments
  FSync.prototype.addAfterEachCallback = function(callback) {
    if(typeof callback !== "function") {
      throw new Error("afterEach must be a function");
    }
    this._callbacks.afterEach.push(callback);
  };

  return FileSystemSync;
});
