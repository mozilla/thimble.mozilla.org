/**
 * The PathCache is an in-memory cache of paths and operations to be performed
 * on them (i.e., update, delete).  These operations need to get added to the
 * SyncQueue and eventually run by the SyncManager.  The PathCache is temporary
 * storage for these until they can be processed.  The PathCache also takes care
 * of reading/writing these operations to storage between loads of the page, in
 * the case that they haven't been processed yet.
 */

define(function(require) {
  var Constants = require("constants");
  var logger = require("logger");

  var SYNC_OPERATION_UPDATE = Constants.SYNC_OPERATION_UPDATE;
  var SYNC_OPERATION_DELETE = Constants.SYNC_OPERATION_DELETE;

  var items;

  // Decide between an update and delete operation, depending on previous operations.
  function mergeOperations(previous, requested) {
    // If there is no pending sync operation, or the new one is the same
    // (update followed by update), just return the new one.
    if(!previous || previous === requested) {
      return requested;
    }

    // A delete trumps a pending update (we can skip a pending update if we'll just delete later)
    if(previous === SYNC_OPERATION_UPDATE && requested === SYNC_OPERATION_DELETE) {
      return SYNC_OPERATION_DELETE;
    }

    // An update trumps a pending delete (we can just update the old contents with new)
    if(previous === SYNC_OPERATION_DELETE && requested === SYNC_OPERATION_UPDATE) {
      return SYNC_OPERATION_UPDATE;
    }

    // Should never hit this, but if we do, default to an update
    console.log("[Thimble Error] unexpected sync states, defaulting to update:", previous, requested);
    return SYNC_OPERATION_UPDATE;
  }

  /**
   * The cache is an in-memory, localStorage-backed array of paths + operations to be
   * synced. It gets merged with the sync queue on a regular basis (i.e., written to
   * disk). We use it so that we don't have two separate writes to the sync queue.
   */
  function init(projectRoot) {
    items = [];

    // Read/write to a key specific to this project's root
    var key = Constants.CACHE_KEY_PREFIX + projectRoot;

    if(!window.localStorage) {
      return;
    }

    // Register to save any in-memory cache operations before we close
    window.addEventListener("unload", function() {
      if(!items.length) {
        return;
      }

      localStorage.setItem(key, JSON.stringify(items));
    });

    var prev = localStorage.getItem(key);
    if(!prev) {
      return;
    }

    // Read any cached operations out of storage
    localStorage.removeItem(key);
    try {
      items = items.concat(JSON.parse(prev));
      logger("project", "initialized file operations cache from storage (" + items.length + " operations)");
    } catch(e) {
      logger("project", "failed to initialize cached file operations from storage", prev);
    }
  }

  // Add a path and operation item to the cache
  function addItem(path, operation) {
    items.push({
      path: path,
      operation: operation
    });
  }

  /**
   * Take all cached path operations and transfer them to the SyncQueue so that
   * they can be processed and run.
   */
  function transferToSyncQueue(syncQueue) {
    // Migrate cached items to sync queue
    items.forEach(function(item) {
      var path = item.path;
      var operation = item.operation;

      var previous = syncQueue.pending[path] || null;
      syncQueue.pending[path] = mergeOperations(previous, operation);
    });

    // Clear all cached items
    items.length = 0;

    return syncQueue;
  }

  return {
    init: init,
    addItem: addItem,
    transferToSyncQueue: transferToSyncQueue
  };
});
