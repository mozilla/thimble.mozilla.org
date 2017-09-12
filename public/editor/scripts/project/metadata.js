/* globals $: true */
var $ = require("jquery");

var constants = require("../../../shared/scripts/constants");

var PROJECT_META_KEY = constants.PROJECT_META_KEY;
var AJAX_DEFAULT_TIMEOUT_MS = constants.AJAX_DEFAULT_TIMEOUT_MS;
var fs = Bramble.getFileSystem();

// We only want one operation at a time on the metadata xattrib.
// Any access must have this lock. This approach assumes only a single
// client per open-project (i.e., one project per tab).
var metadataLock;
var lockQueue = [];

function lock(fn) {
  if (metadataLock) {
    lockQueue.push(fn);
    return;
  }

  metadataLock = Date.now();
  fn();
}

function unlock() {
  metadataLock = null;

  var next = lockQueue.shift();
  if (next) {
    lock(next);
  }
}

function lockSafeCallback(callback) {
  return function() {
    unlock();
    callback.apply(null, arguments);
  };
}

// Read the entire metadata record from the project root's extended attribute.
// Callers should acquire the lock before calling getMetadata().
function getMetadata(root, callback) {
  fs.getxattr(root, PROJECT_META_KEY, function(err, value) {
    if (err && err.code !== "ENOATTR") {
      return callback(err);
    }

    callback(null, value);
  });
}

// Look up the publish.webmaker.org file id for this path
function getFileID(root, path, callback) {
  callback = lockSafeCallback(callback);

  lock(function() {
    getMetadata(root, function(err, value) {
      if (err) {
        return callback(err);
      }

      callback(null, value && value.paths[path]);
    });
  });
}

// Look up the title for this project
function getTitle(root, callback) {
  callback = lockSafeCallback(callback);

  lock(function() {
    getMetadata(root, function(err, value) {
      if (err) {
        return callback(err);
      }

      callback(null, value && value.title);
    });
  });
}

// Update the files metadata for the project to use the title
function setTitle(root, title, callback) {
  callback = lockSafeCallback(callback);

  lock(function() {
    getMetadata(root, function(err, value) {
      if (err) {
        return callback(err);
      }

      value = value || {};
      value.title = title;

      fs.setxattr(root, PROJECT_META_KEY, value, callback);
    });
  });
}

// Update the files metadata for the project to use the given id for this path
function setFileID(root, path, id, callback) {
  callback = lockSafeCallback(callback);

  lock(function() {
    getMetadata(root, function(err, value) {
      if (err) {
        return callback(err);
      }

      value = value || { paths: {} };
      value.paths[path] = id;
      fs.setxattr(root, PROJECT_META_KEY, value, function(err) {
        callback(err);
      });
    });
  });
}

// Update the files metadata for the project to use the given id for this path
function removeFile(root, path, callback) {
  callback = lockSafeCallback(callback);

  lock(function() {
    getMetadata(root, function(err, value) {
      if (err) {
        return callback(err);
      }

      delete value.paths[path];
      fs.setxattr(root, PROJECT_META_KEY, value, function(err) {
        callback(err);
      });
    });
  });
}

// Sets a flag on the project root to indicate whether a project needs to
// be republished or not
function setPublishNeedsUpdate(root, value, callback) {
  callback = lockSafeCallback(callback);

  lock(function() {
    getMetadata(root, function(err, metadata) {
      if (err) {
        return callback(err);
      }

      metadata = metadata || {};
      metadata.publishNeedsUpdate = value;

      fs.setxattr(root, PROJECT_META_KEY, metadata, callback);
    });
  });
}

// Gets the flag on the project root to indicate whether a project needs to
// be republished or not
function getPublishNeedsUpdate(root, callback) {
  callback = lockSafeCallback(callback);

  lock(function() {
    getMetadata(root, function(err, metadata) {
      if (err) {
        return callback(err);
      }

      callback(null, metadata && metadata.publishNeedsUpdate);
    });
  });
}

// Gets the file sync operation queue on the project root, which has information
// about all paths that need to be sync'ed with the server, and what needs to happen.
function getSyncQueue(root, callback) {
  callback = lockSafeCallback(callback);

  lock(function() {
    getMetadata(root, function(err, metadata) {
      if (err) {
        return callback(err);
      }

      // Always return an object that has a `pending` child object.
      var syncQueue = (metadata && metadata.syncQueue) || { pending: {} };
      callback(null, syncQueue);
    });
  });
}

// Sets the file sync operation queue on the project root
function setSyncQueue(root, value, callback) {
  callback = lockSafeCallback(callback);

  lock(function() {
    getMetadata(root, function(err, metadata) {
      if (err) {
        return callback(err);
      }

      metadata = metadata || {};
      metadata.syncQueue = value;

      fs.setxattr(root, PROJECT_META_KEY, metadata, callback);
    });
  });
}

// Places project metadata (project id, file paths + publish ids) as an
// extended attribute on on the project root folder. We don't lock here
// because installing the metadata only happens once on startup.
function setMetadata(config, callback) {
  // Check if there is any metadata already present for that root
  fs.getxattr(config.root, PROJECT_META_KEY, function(err, project) {
    if (err && err.code !== "ENOATTR") {
      return callback(err);
    }

    // If there is, we keep it and overwrite the ones that need to be updated
    project = project || {};
    project.title = config.title;
    project.paths = {};

    // If it exists, data is in the following form, simplify it and make it easier
    // to get file id using a path:
    // [{ id: 1, path: "/index.html", project_id: 3 }, ... ]
    if (config.data) {
      project.id = config.id;

      config.data.forEach(function(info) {
        project.paths[info.path] = info.id;
      });
    }

    fs.setxattr(config.root, PROJECT_META_KEY, project, callback);
  });
}

// Downloads project metadata (project id, file paths + publish ids).
function download(config, callback) {
  if (!config.user || config.update) {
    // There is no metadata to fetch from the server if this project is
    // being upgraded from an anonymous to a persisted project (we push
    // metadata to the server instead of downloading it)
    return callback(null, null);
  }

  var url = config.host + "/projects";
  if (config.id) {
    url += "/" + config.id;
  }
  url += "/files/meta?cacheBust=" + new Date().toISOString();

  var request = $.ajax({
    type: "GET",
    headers: {
      Accept: "application/json"
    },
    url: url,
    timeout: AJAX_DEFAULT_TIMEOUT_MS
  });
  request.done(function(data) {
    callback(null, data);
  });
  request.fail(function(jqXHR, status, err) {
    err = err || new Error("unknown network error");
    callback(err);
  });
}

function loadAnonymous(config, callback) {
  callback = lockSafeCallback(callback);

  lock(function() {
    fs.getxattr(config.root, PROJECT_META_KEY, function(err) {
      // We use this because `getMetadata()` swallows the 'ENOATTR'
      // error, which we use to know whether to write
      if (err) {
        if (err.code !== "ENOATTR") {
          return callback(err);
        }
        return setMetadata(config, callback);
      }

      callback();
    });
  });
}

function install(config, callback) {
  if (!config.user) {
    return loadAnonymous(config, callback);
  }

  setMetadata(config, callback);
}

function update(config, callback) {
  if (!config.update) {
    return callback();
  }

  var request = $.ajax({
    type: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Csrf-Token": config.csrfToken
    },
    url: config.host + "/projects/" + config.id,
    data: JSON.stringify(config.data),
    timeout: AJAX_DEFAULT_TIMEOUT_MS
  });
  request.done(function() {
    callback();
  });
  request.fail(function(jqXHR, status, err) {
    err = err || new Error("unknown network error");
    callback(err);
  });
}

module.exports = {
  download: download,
  install: install,
  update: update,
  getFileID: getFileID,
  setFileID: setFileID,
  getTitle: getTitle,
  setTitle: setTitle,
  removeFile: removeFile,
  setPublishNeedsUpdate: setPublishNeedsUpdate,
  getPublishNeedsUpdate: getPublishNeedsUpdate,
  getSyncQueue: getSyncQueue,
  setSyncQueue: setSyncQueue
};
