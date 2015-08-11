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

  function pushFileChange(url, csrfToken, fs, path) {
    var context = this;
    var options = {
      headers: {
        "X-Csrf-Token": csrfToken
      },
      type: "PUT",
      url: url,
      cache: false,
      contentType: false,
      processData: false
    };

    path = Project.stripRoot(path);

    function send(id) {
      var error;
      var request;

      if(id) {
        options.url = options.url + "/" + id;
      }

      function finish() {
        context.queueLength--;
        hideFileState(context.queueLength);
        triggerCallbacks(context._callbacks.afterEach, [error, path]);
      }

      request = $.ajax(options);
      request.done(function() {
        if(request.status !== 201 && request.status !== 200) {
          error = request.body;
          console.error("[Bramble] Server did not persist ", path, ". Server responded with status ", request.status);
        }

        var data;
        try {
          data = JSON.parse(request.body);
        } catch(e) {
          console.error("[Bramble] unable to parse server response", e);
          finish();
        }

        Project.setFileID(path, data.id, finish);
      });
      request.fail(function(jqXHR, status, err) {
        error = err;
        console.error("[Bramble] Failed to send request to persist the file to the server with: ", err);
        finish();
      });
    }

    fs.readFile(path, function(err, data) {
      function onerror(err) {
        context.queueLength--;
        console.error("[Bramble] Failed to read ", path, " with ", err);
        triggerCallbacks(context._callbacks.afterEach, [err, path]);        
      }

      if(err) {
        return onerror(err);
      }

      options.data = FileSystemSync.toFormData(path, data);
      Project.getFileID(path, function(err, id) {
        if(err) {
          return onerror(err);
        }
        send(id);
      });
    });
  }

  function pushFileDelete(url, csrfToken, fs, path) {
    var context = this;
    var error;

    path = Project.stripRoot(path);

    function finish() {
      context.queueLength--;
      hideFileState(context.queueLength);
      triggerCallbacks(context._callbacks.afterEach, [error, path]);
    }

    function doDelete(id) {
      var request = $.ajax({
        contentType: "application/json",
        headers: {
          "X-Csrf-Token": csrfToken
        },
        type: "PUT",
        url: url + "/" + id,
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
        // TODO: remove this file entry from the xattrib
      });
      request.fail(function(jqXHR, status, err) {
        error = err;
        console.error("[Bramble] Failed to send request to delete the file to the server with: ", err);
      });
      request.always(finish);
    }

    Project.getFileID(path, function(err, id) {
      if(err) {
        error = err;
        return finish();
      }

      doDelete(id);
    });
  }

  function pushFileRename() {
    // Needs to be implemented
    // TODO: update xattrib meta to correct pathname
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

  FileSystemSync.init = function(authenticated, persistanceUrls, csrfToken) {
    // If an anonymous user is using thimble, they
    // will not have any persistence of files
    if(!authenticated) {
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

  /**
   * Static helper for construcitng a FormData object from file info.
   */
  FileSystemSync.toFormData = function(path, buffer, dateUpdated) {
    dateUpdated = dateUpdated || (new Date()).toISOString();

    var formData = new FormData();
    formData.append("dateUpdated", dateUpdated);
    formData.append("bramblePath", path);
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
