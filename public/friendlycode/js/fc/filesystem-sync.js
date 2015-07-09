define(["jquery"], function($) {
  var FileSystemSync = {};

  function hideFileState(remainingFiles) {
    if(!remainingFiles) {
      $("#navbar-save-indicator").addClass("hide");
    }
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
      var request = $.ajax(options);
      request.done(function() {
        if(request.status !== 201 && request.status !== 200) {
          console.error("[Bramble] Server did not persist ", path, ". Server responded with status ", request.status);
          return;
        }

        if(context.afterEach) {
          context.afterEach();
        }
      });
      request.fail(function(jqXHR, status, err) {
        console.error("[Bramble] Failed to send request to persist the file to the server with: ", err);
      });
      request.always(function() {
        context.queueLength--;
        hideFileState(context.queueLength);
      });
    }

    fs.readFile(path, function(err, data) {
      if(err) {
        console.error("[Bramble] Failed to read ", path, " with ", err);
        return;
      }

      options.data = JSON.stringify({
        path: path,
        buffer: data
      });

      send();
    });
  }

  function pushFileDelete(url, csrfToken, fs, path) {
    var context = this;
    var request = $.ajax({
      contentType: "application/json",
      headers: {
        "X-Csrf-Token": csrfToken
      },
      type: "PUT",
      url: url,
      data: JSON.stringify({
        "path": path
      })
    });
    request.done(function() {
      if(request.status !== 200) {
        console.error("[Bramble] Server did not persist ", path, ". Server responded with status ", request.status);
      }

      if(context.afterEach) {
        context.afterEach();
      }
    });
    request.fail(function(jqXHR, status, err) {
      console.error("[Bramble] Failed to send request to delete the file to the server with: ", err);
    });
    request.always(function() {
      context.queueLength--;
      hideFileState(context.queueLength);
    });
  }

  function pushFileRename() {}

  function FSync() {
    this.queueLength = 0;
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
        if(fsync.beforeEach) {
          fsync.beforeEach();
        }

        Array.prototype.unshift.call(arguments, url, csrfToken, fs);
        handler.apply(fsync, arguments);
      };
    }
    Bramble.once("ready", function(bramble) {
      bramble.on("fileChange", configHandler(pushFileChange, persistanceUrls.createOrUpdate));
      bramble.on("fileDelete", configHandler(pushFileDelete, persistanceUrls.del));
      bramble.on("fileRename", configHandler(pushFileRename, persistanceUrls.rename));
    });

    return fsync;
  };

  return FileSystemSync;
});
