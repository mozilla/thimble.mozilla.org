/* globals $: true */
/**
 * The PathCache is an in-memory cache of paths and operations to be performed
 * on them (i.e., update, delete).  These operations need to get added to the
 * SyncQueue and eventually run by the SyncManager.  The PathCache is temporary
 * storage for these until they can be processed.  The PathCache also takes care
 * of reading/writing these operations to storage between loads of the page, in
 * the case that they haven't been processed yet.
 */

var $ = require("jquery");

var Constants = require("../../../shared/scripts/constants");
var logger = require("../lib/logger");

var SYNC_OPERATION_UPDATE = Constants.SYNC_OPERATION_UPDATE;
var SYNC_OPERATION_DELETE = Constants.SYNC_OPERATION_DELETE;
var SYNC_OPERATION_RENAME_FOLDER = Constants.SYNC_OPERATION_RENAME_FOLDER;

var items;

// Decide between an update and delete operation, depending on previous operations.
function mergeOperations(previous, requested) {
  // If there is no pending sync operation, or the new one is the same
  // (update followed by update), just return the new one.
  if (!previous || previous === requested) {
    return requested;
  }

  // A delete trumps a pending update (we can skip a pending update if we'll just delete later)
  if (
    previous === SYNC_OPERATION_UPDATE &&
    requested === SYNC_OPERATION_DELETE
  ) {
    return SYNC_OPERATION_DELETE;
  }

  // An update trumps a pending delete (we can just update the old contents with new)
  if (
    previous === SYNC_OPERATION_DELETE &&
    requested === SYNC_OPERATION_UPDATE
  ) {
    return SYNC_OPERATION_UPDATE;
  }

  // Should never hit this, but if we do, default to an update
  console.log(
    "[Thimble Error] unexpected sync states, defaulting to update:",
    previous,
    requested
  );
  return SYNC_OPERATION_UPDATE;
}

/**
 * The cache is an in-memory, localStorage-backed array of paths + operations to be
 * synced. It gets merged with the sync queue on a regular basis (i.e., written to
 * disk). We use it so that we don't have two separate writes to the sync queue.
 */
function init(projectRoot) {
  items = {
    folders: [],
    files: []
  };

  // Read/write to a key specific to this project's root
  var key = Constants.CACHE_KEY_PREFIX + projectRoot;
  var noOfOps = 0;

  if (!window.localStorage) {
    return;
  }

  // Register to save any in-memory cache operations before we close
  window.addEventListener("unload", function() {
    var noOfOpsLeft = items.folders.length + items.files.length;
    if (!noOfOpsLeft) {
      return;
    }

    localStorage.setItem(key, JSON.stringify(items));
  });

  var prev = localStorage.getItem(key);
  if (!prev) {
    return;
  }

  // Read any cached operations out of storage
  localStorage.removeItem(key);
  try {
    items = JSON.parse(prev);
    noOfOps = items.files.length + items.folders.length;
    logger(
      "project",
      "initialized file operations cache from storage (" +
        noOfOps +
        " operations)"
    );
  } catch (e) {
    logger(
      "project",
      "failed to initialize cached file operations from storage",
      prev
    );
  }
}

// Add a path and operation item to the cache
function addItem(path, operation, addToTop) {
  var fn = addToTop ? "unshift" : "push";
  var item = {
    path: path,
    operation: operation
  };

  if (operation !== SYNC_OPERATION_RENAME_FOLDER) {
    items.files[fn](item);
  } else {
    // Here item will look something like:
    // {
    //    path: {
    //     "oldPath": "/old/folder/path",
    //     "newPath": "/new/folder/path",
    //     "children": [ relativeFilePath1, relativeFilePath2, ... ]
    //   },
    //   operation: "folder-rename"
    // }
    items.folders[fn](item);
  }
}

/**
 * Take all cached path operations and transfer them to the SyncQueue so that
 * they can be processed and run.
 */
function transferToSyncQueue(syncQueue) {
  // Migrate cached items to sync queue
  // Also update paths in the sync queue based on folder renames

  // Step 1: Add the folder renames and construct an array of path mappings
  // of paths that need to be renamed in the syncQueue and items list
  var renamedPaths = [];

  items.folders.forEach(function(item) {
    var folder = item.path;
    var persistedPath = folder.oldPath;
    var previous = syncQueue.pending[persistedPath] || null;
    var changedFiles = folder.children;

    if (previous) {
      persistedPath = previous.persistedPath;
      $.extend(changedFiles, previous.changed);
      delete syncQueue.pending[folder.oldPath];
    }

    syncQueue.pending[folder.newPath] = {
      operation: folder.operation,
      persistedPath: persistedPath,
      changed: changedFiles
    };

    var pathChanges = {};
    changedFiles.forEach(function(relPath) {
      pathChanges[folder.oldPath + relPath] = folder.newPath + relPath;
    });

    renamedPaths.push(pathChanges);
  });

  // Step 2: Apply the rename changes to the items and syncQueue
  renamedPaths.forEach(function(renamedPathList) {
    items.files.forEach(function(file) {
      file.path = renamedPathList[file.path] || file.path;
    });

    Object.keys(syncQueue.pending).forEach(function(file) {
      var newFilePath = renamedPathList[file];

      if (newFilePath) {
        syncQueue.pending[newFilePath] = syncQueue.pending[file];
        delete syncQueue.pending[file];
      }
    });
  });

  // Step 3: Add the file change operations to the sync queue
  items.files.forEach(function(item) {
    var path = item.path;
    var operation = item.operation;

    var previous = syncQueue.pending[path] || null;
    syncQueue.pending[path] = mergeOperations(previous, operation);
  });

  // Step 4: Clear all cached items
  items = {
    files: [],
    folders: []
  };

  return syncQueue;
}

module.exports = {
  init: init,
  addItem: addItem,
  transferToSyncQueue: transferToSyncQueue
};
