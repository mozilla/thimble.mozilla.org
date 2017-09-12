/* globals $: true */
var $ = require("jquery");

var Remote = require("./remote");
var Metadata = require("./metadata");
var logger = require("../lib/logger");
var PathCache = require("../filesystem-sync/path-cache");
var Constants = require("../../../shared/scripts/constants");

var Path = Bramble.Filer.Path;

var _host;
var _publishUrl;

var _user;
var _id;
var _title;
var _fs;
var _anonymousId;
var _remixId;
var _description;
var _projectLoadStrategy;

var DEFAULT_INDEX_HTML_URL = "/default-files/html.txt";

function getAnonymousId() {
  return _anonymousId;
}

function getDescription() {
  return _description;
}

function setDescription(newDescription) {
  _description = newDescription;
}

function getTitle() {
  return _title;
}

function setTitle(title, callback) {
  Metadata.setTitle(getRoot(), title, function(err) {
    if (err) {
      return callback(err);
    }

    _title = title;
    callback();
  });
}

function getUser() {
  return _user;
}

function getID() {
  return _id;
}

function getHost() {
  return _host;
}

function getPublishUrl() {
  return _publishUrl;
}

function setPublishUrl(value) {
  _publishUrl = value;
}

function getRoot() {
  if (!_user) {
    return Path.join(Constants.ANONYMOUS_USER_FOLDER, _anonymousId.toString());
  }

  return Path.join("/", _user.toString(), "projects", _id.toString());
}

// From /7/projects/5/index.html to /index.html
function stripRoot(path) {
  return path.replace(getRoot(), "");
}

// From /index.html to /7/projects/5/index.html to
function addRoot(path) {
  return Path.join(getRoot(), path);
}

// Look up the publish.webmaker.org file id for this path
function getFileID(path, callback) {
  Metadata.getFileID(getRoot(), stripRoot(path), callback);
}

// Update the files metadata for the project to use the given id for this path
function setFileID(path, id, callback) {
  Metadata.setFileID(getRoot(), stripRoot(path), id, callback);
}

// Update the files metadata for the project to use the given id for this path
function removeFile(path, callback) {
  Metadata.removeFile(getRoot(), stripRoot(path), callback);
}

// Sets a flag on the project root that indicates whether we need to update
// the published version of this project or not
function publishNeedsUpdate(value, callback) {
  Metadata.setPublishNeedsUpdate(getRoot(), value, callback);
}

// Gets the flag from the project root that indicates whether we need to
// update the published version of this project or not
function getPublishNeedsUpdate(callback) {
  Metadata.getPublishNeedsUpdate(getRoot(), callback);
}

// Gets the file sync operation queue on the project root, which has information
// about all paths that need to be sync'ed with the server, and what needs to happen.
function getSyncQueue(callback) {
  Metadata.getSyncQueue(getRoot(), callback);
}

// Sets the file sync operation queue on the project root
function setSyncQueue(value, callback) {
  Metadata.setSyncQueue(getRoot(), value, callback);
}

function queueFileUpdate(path) {
  logger("project", "queueFileUpdate", path);
  PathCache.addItem(path, Constants.SYNC_OPERATION_UPDATE);
}

function queueFileDelete(path) {
  logger("project", "queueFileDelete", path);
  PathCache.addItem(path, Constants.SYNC_OPERATION_DELETE);
}

function queueFolderRename(paths, addToTop) {
  logger("project", "queueFolderRename", paths);
  PathCache.addItem(paths, Constants.SYNC_OPERATION_RENAME_FOLDER, addToTop);
}

function init(projectDetails, host, callback) {
  _user = projectDetails.userID;
  _id = projectDetails.id;
  _anonymousId = projectDetails.anonymousId;
  _remixId = projectDetails.remixId;
  _host = host;
  _publishUrl = projectDetails.publishUrl;
  _fs = Bramble.getFileSystem();
  _description = projectDetails.description;
  _projectLoadStrategy = projectDetails.projectLoadStrategy;

  var metadataLocation =
    _user && _anonymousId
      ? Path.join(Constants.ANONYMOUS_USER_FOLDER, _anonymousId.toString())
      : getRoot();

  // We have to check if we can access the 'title' stored
  // on an xattr first to know which value
  Metadata.getTitle(metadataLocation, function(err, title) {
    if (err) {
      if (err.code !== "ENOENT") {
        callback(err);
      } else {
        _title = projectDetails.title;
        callback();
      }
      return;
    }

    if (_user) {
      _title = title;
    } else if (title) {
      // Prefer the stored title in the anonymous case in case the
      // anonymous user changed it
      _title = title;
    } else {
      _title = projectDetails.title;
    }

    callback();
  });
}

// Set all necesary data for this project, based on makeDetails rendered into page.
function _load(csrfToken, syncQueue, callback) {
  var now = new Date().toISOString();
  var isUpdate = !!_user && !!_anonymousId;

  // Step 1: download the project's metadata
  Metadata.download(
    {
      host: _host,
      id: _id,
      user: _user,
      update: isUpdate
    },
    function(err, data) {
      if (err) {
        return callback(err);
      }

      // Step 2: download the project's contents (files) or upload an
      // anonymous project's content if this is an upgrade, and install into the root
      Remote.loadProject(
        {
          root: getRoot(),
          host: _host,
          user: _user,
          id: _id,
          remixId: _remixId,
          anonymousId: _anonymousId,
          syncQueue: syncQueue,
          data: data,
          projectLoadStrategy: _projectLoadStrategy
        },
        function(err, pathUpdatesCache) {
          if (err) {
            // If we have paths to sync in the SyncQueue, ignore this error and keep going
            if (!Object.keys(syncQueue.pending).length) {
              return callback(err);
            }
          }

          // If there are cached paths that need to be updated, queue those now
          if (pathUpdatesCache && pathUpdatesCache.length) {
            pathUpdatesCache.forEach(function(path) {
              queueFileUpdate(path);
            });
          }

          // Step 3: If this was a project upgrade (from anonymous to authenticated),
          // update the project metadata on the server
          Metadata.update(
            {
              host: _host,
              update: isUpdate,
              id: _id,
              csrfToken: csrfToken,
              data: {
                title: _title,
                description: _description,
                dateCreated: now,
                dateUpdated: now
              }
            },
            function(err) {
              if (err) {
                return callback(err);
              }

              // Step 4: install the project's metadata (project + file IDs on publish) and
              // install into an xattrib on the project root.
              Metadata.install(
                {
                  root: getRoot(),
                  title: _title,
                  id: _id,
                  data: data,
                  user: _user,
                  update: isUpdate
                },
                function(err) {
                  if (err) {
                    return callback(err);
                  }

                  // Find the index.html file in the project root to open
                  var indexLocation = Path.join(getRoot(), "index.html");
                  _fs.exists(indexLocation, function(exists) {
                    if (exists) {
                      callback(null, indexLocation);
                      return;
                    }

                    // Create a default index.html file
                    $.get(DEFAULT_INDEX_HTML_URL).then(function(data) {
                      _fs.writeFile(indexLocation, data, function(err) {
                        if (err) {
                          console.error("Cannot write file to project: ", err);
                          callback(err);
                          return;
                        }

                        if (_user) {
                          // Make sure we will sync the index.html file we have
                          // created.
                          queueFileUpdate(addRoot("index.html"));
                        }

                        callback(null, indexLocation);
                      });
                    }, callback);
                  });
                }
              );
            }
          );
        }
      );
    }
  );
}

/**
 * The load process happens in a number of stages.  First, we deal with any
 * cached path operations that were unprocessed/unfinished when the app closed.
 * After we have an accurate SyncQueue, we continue loading the files/metadata
 * for the project.
 */
function load(csrfToken, callback) {
  PathCache.init(getRoot());
  getSyncQueue(function(err, syncQueue) {
    if (err) {
      // If the project root doesn't exist yet, we can simulate an empty SyncQueue
      // since there are no path operations needing to be run yet.
      if (err.code === "ENOENT") {
        _load(csrfToken, { pending: {} }, callback);
      } else {
        callback(err);
      }
      return;
    }

    // If we had cached path operations, merge them into the SyncQueue and save.
    syncQueue = PathCache.transferToSyncQueue(syncQueue);

    setSyncQueue(syncQueue, function(err) {
      if (err) {
        callback(err);
        return;
      }

      _load(csrfToken, syncQueue, callback);
    });
  });
}

module.exports = {
  init: init,
  load: load,

  getRoot: getRoot,
  getUser: getUser,
  getID: getID,
  getHost: getHost,
  getPublishUrl: getPublishUrl,
  setPublishUrl: setPublishUrl,
  getFileID: getFileID,
  setFileID: setFileID,
  getTitle: getTitle,
  setTitle: setTitle,
  getDescription: getDescription,
  setDescription: setDescription,
  getAnonymousId: getAnonymousId,

  stripRoot: stripRoot,
  addRoot: addRoot,
  removeFile: removeFile,

  publishNeedsUpdate: publishNeedsUpdate,
  getPublishNeedsUpdate: getPublishNeedsUpdate,

  setSyncQueue: setSyncQueue,
  getSyncQueue: getSyncQueue,
  queueFileUpdate: queueFileUpdate,
  queueFileDelete: queueFileDelete,
  queueFolderRename: queueFolderRename
};
