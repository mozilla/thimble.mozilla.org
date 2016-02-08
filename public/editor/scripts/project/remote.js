define(function(require) {
  var constants = require("constants");

  var Path = Bramble.Filer.Path;
  var Buffer = Bramble.Filer.Buffer;
  var fs = Bramble.getFileSystem();

  // Installs a tarball (arraybuffer) containing the project's files/folders.
  function installTarball(config, tarball, callback) {
    var untarWorker;
    var pending = null;
    var sh = new fs.Shell();
    var root = config.root;
    var pendingOperations = config.syncQueue.pending;

    function extract(path, data, callback) {
      var basedir = Path.dirname(path);

      sh.mkdirp(basedir, function(err) {
        if(err) {
          return callback(err);
        }

        fs.writeFile(path, new Buffer(data), {encoding: null}, callback);
      });
    }

    // If there are pending operations to be run in the SyncQueue for a
    // given path in the project (e.g., user deleted a file locally, but closed
    // before the change could be synced to the server), we can safely ignore
    // the initial extract, since we'll just be modifying the file anyway.
    function maybeExtract(path, data, callback) {
      path = Path.join(root, path);

      if(pendingOperations[path]) {
        callback();
        return;
      }

      extract(path, data, callback);
    }

    function finish(err) {
      untarWorker.terminate();
      untarWorker = null;

      callback(err);
    }

    function writeCallback(err) {
      if(err) {
        console.error("[Thimble error] couldn't extract file for tar", err);
      }

      pending--;
      if(pending === 0) {
        finish(err);
      }
    }

    untarWorker = new Worker("/scripts/vendor/bitjs-untar-worker.min.js");
    untarWorker.addEventListener("message", function(e) {
      var data = e.data;

      if(data.type === "progress" && pending === null) {
        // Set the total number of files we need to deal with so we know when we're done
        pending = data.totalFilesInArchive;
      } else if(data.type === "extract") {
        maybeExtract(data.unarchivedFile.filename, data.unarchivedFile.fileData, writeCallback);
      } else if(data.type === "error") {
        finish(new Error("[Thimble error]: " + data.msg));
      }
    });

    untarWorker.postMessage({file: tarball});
  }

  function loadTarball(config, callback) {
    // jQuery doesn't seem to support getting the arraybuffer type
    var url = config.host + "/projects";
    if (config.remixId || config.id) {
      url += "/" + (config.remixId || config.id);
    }
    url += "/files/data?cacheBust=" + (new Date()).toISOString();

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
      if(this.status !== 200) {
        return callback(new Error("[Thimble error] unable to get tarball, status was:", this.status));
      }

      installTarball(config, this.response, callback);
    };
    xhr.send();
  }

  function upgradeAnonymousProject(config, callback) {
    var shell = new fs.Shell();
    var oldRoot = Path.join(constants.ANONYMOUS_USER_FOLDER, config.anonymousId.toString());
    var newRoot = config.root;
    var pathUpdatesCache = [];

    function upgradeFile(path, next) {
      if (path.match(/\/$/)) {
        return next();
      }

      fs.readFile(path, function(err, data) {
        if (err) {
          return next(err);
        }

        var relativePath = Path.relative(oldRoot, path);
        var newPath = Path.join(newRoot, relativePath);
        var parent = Path.dirname(newPath);

        shell.mkdirp(parent, function(err) {
          if (err) {
            return next(err);
          }

          fs.writeFile(newPath, data, {encoding: null}, function(err) {
            if (err) {
              return next(err);
            }

            // Track this as a file to be persisted to publish
            pathUpdatesCache.push(newPath);
            next();
          });
        });
      });
    }

    shell.find(oldRoot, {exec: upgradeFile}, function(err) {
      if (err) {
        console.error("[Thimble Error] unable to process path while upgrading anonymous project", err);
        return callback(err);
      }

      shell.rm(oldRoot, {recursive: true}, function(err) {
        if(err) {
          console.error("[Thimble Error] unable to remove path while upgrading anonymous project", err);
          return callback(err);
        }

        // Send back the list of paths to be updated
        callback(null, pathUpdatesCache);
      });
    });
  }

  function loadProject(config, callback) {
    if (config.user) {
      if (config.anonymousId) {
        return upgradeAnonymousProject(config, callback);
      }

      return loadTarball(config, callback);
    }

    // First, check if this anonymous project already exists by checking the
    // root. If it exists, we've done this before and no loading is required
    fs.stat(config.root, function(err) {
      if (err) {
        if (err.code !== "ENOENT") {
          return callback(err);
        }

        // Anonymous project does not exist
        (new fs.Shell()).mkdirp(config.root, function(err) {
          if (err) {
            return callback(err);
          }

          loadTarball(config, callback);
        });
      } else {
        callback();
      }
    });
  }

  return {
    loadProject: loadProject
  };
});
