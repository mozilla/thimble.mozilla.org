var $ = require("jquery");

var constants = require("../../../shared/scripts/constants");

var Path = Bramble.Filer.Path;
var Buffer = Bramble.Filer.Buffer;
var fs = Bramble.getFileSystem();

// If there are pending operations to be run in the SyncQueue for a
// given path in the project (e.g., user deleted a file locally, but closed
// before the change could be synced to the server), we can safely ignore
// this path, since we'll just be modifying the file anyway.
function shouldSkipPath(pending, path) {
  return pending[path];
}

function installFile(path, data, callback) {
  var sh = new fs.Shell();
  var basedir = Path.dirname(path);

  sh.mkdirp(basedir, function(err) {
    if (err) {
      return callback(err);
    }

    fs.writeFile(path, new Buffer(data), { encoding: null }, callback);
  });
}

// Installs a tarball (arraybuffer) containing the project's files/folders.
function installTarball(config, tarball, callback) {
  var untarWorker;
  var pending = null;
  var root = config.root;
  var pendingOperations = config.syncQueue.pending;

  function maybeExtract(path, data, callback) {
    path = Path.join(root, path);

    if (shouldSkipPath(pendingOperations, path)) {
      callback();
      return;
    }

    installFile(path, data, callback);
  }

  function finish(err) {
    untarWorker.terminate();
    untarWorker = null;

    callback(err);
  }

  function writeCallback(err) {
    if (err) {
      console.error("[Thimble error] couldn't extract file for tar", err);
    }

    pending--;
    if (pending === 0) {
      finish(err);
    }
  }

  untarWorker = new Worker("/resources/scripts/bitjs-untar-worker.min.js");
  untarWorker.addEventListener("message", function(e) {
    var data = e.data;

    if (data.type === "progress" && pending === null) {
      // Set the total number of files we need to deal with so we know when we're done
      pending = data.totalFilesInArchive;
    } else if (data.type === "extract") {
      maybeExtract(
        data.unarchivedFile.filename,
        data.unarchivedFile.fileData,
        writeCallback
      );
    } else if (data.type === "error") {
      finish(new Error("[Thimble error]: " + data.msg));
    }
  });

  untarWorker.postMessage({ file: tarball });
}

function loadTarball(config, callback) {
  // jQuery doesn't seem to support getting the arraybuffer type
  var url = config.host + "/projects";
  if (config.remixId || config.id) {
    url += "/" + (config.remixId || config.id);
  }
  url += "/files/data?cacheBust=" + new Date().toISOString();

  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function() {
    if (this.status !== 200) {
      return callback(
        new Error(
          "[Thimble error] unable to get tarball, status was:",
          this.status
        )
      );
    }

    installTarball(config, this.response, callback);
  };
  xhr.send();
}

// Load all files as separate requests.  File data is of the form:
// [{ id: 1, path: "/index.html", project_id: 3 }, ... ]
function loadFiles(config, callback) {
  if (!Array.isArray(config.data) && config.data.length > 0) {
    return callback(new Error("file metadata was missing or in wrong form"));
  }

  var root = config.root;
  var url = config.host + "/files/";

  $.when
    .apply(
      $,
      config.data.map(function(fileInfo) {
        var deferred = $.Deferred();
        var path = Path.join(root, fileInfo.path);
        var pendingOperations = config.syncQueue.pending;

        if (shouldSkipPath(pendingOperations, path)) {
          return deferred.resolve().promise();
        }

        // jQuery doesn't seem to support getting the arraybuffer type
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url + fileInfo.id, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function() {
          if (this.status !== 200) {
            return deferred.reject();
          }

          installFile(path, this.response, function(err) {
            if (err) {
              return deferred.reject();
            }
            deferred.resolve();
          });
        };
        xhr.send();

        return deferred.promise();
      })
    )
    .then(callback, function() {
      callback(new Error("[Thimble error] unable to load project files."));
    });
}

function upgradeAnonymousProject(config, callback) {
  var shell = new fs.Shell();
  var oldRoot = Path.join(
    constants.ANONYMOUS_USER_FOLDER,
    config.anonymousId.toString()
  );
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

        fs.writeFile(newPath, data, { encoding: null }, function(err) {
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

  shell.find(oldRoot, { exec: upgradeFile }, function(err) {
    if (err) {
      console.error(
        "[Thimble Error] unable to process path while upgrading anonymous project",
        err
      );
      return callback(err);
    }

    shell.rm(oldRoot, { recursive: true }, function(err) {
      if (err) {
        console.error(
          "[Thimble Error] unable to remove path while upgrading anonymous project",
          err
        );
        return callback(err);
      }

      // Send back the list of paths to be updated
      callback(null, pathUpdatesCache);
    });
  });
}

function load(config, callback) {
  // Support loading projects as a single tarball or as a set of individual files.
  // Change the value via .env on the server and the PROJECT_LOAD_STRATEGY variable.
  // Default to loading a tarball.
  if (config.projectLoadStrategy === "files") {
    loadFiles(config, callback);
  } else {
    loadTarball(config, callback);
  }
}

function loadProject(config, callback) {
  if (config.user) {
    if (config.anonymousId) {
      return upgradeAnonymousProject(config, callback);
    }

    return load(config, callback);
  }

  // First, check if this anonymous project already exists by checking the
  // root. If it exists, we've done this before and no loading is required
  fs.stat(config.root, function(err) {
    if (err) {
      if (err.code !== "ENOENT") {
        return callback(err);
      }

      // Anonymous project does not exist
      new fs.Shell().mkdirp(config.root, function(err) {
        if (err) {
          return callback(err);
        }

        // Prefer loading as tarball if this is the default project, even if loadfiles=1.
        loadTarball(config, callback);
      });
    } else {
      callback();
    }
  });
}

module.exports = {
  loadProject: loadProject
};
