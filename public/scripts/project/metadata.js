define(function(require) {
  var $ = require("jquery");
  var PROJECT_META_KEY = "thimble-project-meta";
  var fs = Bramble.getFileSystem();

  // We only want one operation at a time on the metadata xattrib.
  // Any access must have this lock. This approach assumes only a single
  // client per open-project (i.e., one project per tab).
  var metadataLock;
  var lockQueue = [];

  function lock(fn) {
    if(metadataLock) {
      lockQueue.push(fn);
      return;
    }

    metadataLock = Date.now();
    fn();
  }

  function unlock() {
    metadataLock = null;

    var next = lockQueue.shift();
    if(next) {
      lock(next);
    }
  }

  // Read the entire metadata record from the project root's extended attribute.
  // Callers should acquire the lock before calling getMetadata().
  function getMetadata(root, callback) {
    fs.getxattr(root, PROJECT_META_KEY, function(err, value) {
      if(err && err.code !== 'ENOATTR') {
        return callback(err);
      }

      callback(null, value);
    });
  }

  // Look up the publish.webmaker.org file id for this path
  function getFileID(root, path, callback) {
    lock(function() {
      getMetadata(root, function(err, value) {
        if(err) {
          return callback(err);
        }

        callback(null, value.paths[path]);
        unlock();
      });
    });
  }

  // Update the files metadata for the project to use the given id for this path
  function setFileID(root, path, id, callback) {
    lock(function() {
      getMetadata(root, function(err, value) {
        if(err) {
          return callback(err);
        }

        value.paths[path] = id;
        fs.setxattr(root, PROJECT_META_KEY, value, function(err) {
          callback(err);
          unlock();
        });
      });
    });
  }

  // Update the files metadata for the project to use the given id for this path
  function removeFile(root, path, callback) {
    lock(function() {
      getMetadata(root, function(err, value) {
        if(err) {
          return callback(err);
        }

        delete value.paths[path];
        fs.setxattr(root, PROJECT_META_KEY, value, function(err) {
          callback(err);
          unlock();
        });
      });
    });
  }

  // Places project metadata (project id, file paths + publish ids) as an
  // extended attribute on on the project root folder. We don't lock here
  // because installing the metadata only happens once on startup.
  function setMetadata(root, data, callback) {
    // Data is in the following form, simplify it and make it easier
    // to get file id using a path:
    // [{ id: 1, path: "/index.html", project_id: 3 }, ... ]
    var project = {
      id: data[0].project_id,
      paths: {}
    };

    data.forEach(function(info) {
      project.paths[info.path] = info.id;
    });

    fs.setxattr(root, PROJECT_META_KEY, project, callback);
  }

  function loadMetadata(root, host, callback) {
    var url = host + "/getFileMeta?cacheBust=" + (new Date()).toISOString();
    var request = $.ajax({
      type: "GET",
      headers: {
        "Accept": "application/json"
      },
      url: url
    });
    request.done(function(data) {
      setMetadata(root, data, callback);
    });
    request.fail(function(jqXHR, status, err) {
      callback(err);
    });
  }

  return {
    loadMetadata: loadMetadata,
    getFileID: getFileID,
    setFileID: setFileID,
    removeFile: removeFile
  };
});
