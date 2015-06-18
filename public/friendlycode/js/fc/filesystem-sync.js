define(["jquery"], function($) {
  "use strict";

  var FileSystemSync = {};

  function pushFileChange(url, csrfToken, fs, path) {
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
        if(request.readyState !== 4) {
          return;
        }

        if(request.status !== 201 && request.status !== 200) {
          // TODO: handle error case here
          console.error("Server did not persist file");
          return;
        }

        console.log("Successfully persisted ", path);
      });
      request.fail(function(jqXHR, status, err) {
        console.error("Failed to send request to persist the file to the server with: ", err);
      });
    }

    fs.readFile(path, function(err, data) {
      if(err) {
        // TODO: handle errors
        throw err;
      }

      options.data = JSON.stringify({
        path: path,
        buffer: data
      });

      send();
    });
  }

  function pushFileDelete(url, csrfToken, fs, path) {
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
      if(request.readyState !== 4) {
        return;
      }

      if(request.status !== 200) {
        // TODO: handle error case here
        console.error("Server did not persist file");
        return;
      }

      console.log("Successfully deleted ", path);
    });
    request.fail(function(jqXHR, status, err) {
      console.error("Failed to send request to delete the file to the server with: ", err);
    });
  }

  function pushFileRename() {}

  FileSystemSync.init = function(projectName, persistanceUrls, csrfToken) {
    if(!projectName) {
      return;
    }

    var fs = Bramble.getFileSystem();

    function configHandler(handler, url) {
      return function() {
        Array.prototype.unshift.call(arguments, url, csrfToken, fs);
        handler.apply(null, arguments);
      };
    }

    Bramble.on("ready", function(bramble) {
      bramble.on("fileChange", configHandler(pushFileChange, persistanceUrls.createOrUpdate));
      bramble.on("fileDelete", configHandler(pushFileDelete, persistanceUrls.del));
      bramble.on("fileRename", configHandler(pushFileRename, persistanceUrls.rename));
    });
  };

  return FileSystemSync;
});
