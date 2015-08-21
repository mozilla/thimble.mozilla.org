// If the lock exists,it's almost guaranteed to be valid since the
// expiry serves to prevent completely locking access to a project
// in edge cases.
define(function(require) {
  var Constants = require('constants');

  var LOCK_EXPIRY_MS = Constants.LOCK_EXPIRY_MS;
  var LOCK_PREFIX = Constants.LOCK_PREFIX;

  function getLockID(projectID) {
    return LOCK_PREFIX + projectID;
  }

  function getLock(projectID) {
    return localStorage.getItem(getLockID(projectID));
  }

  function setLock(projectID, value) {
    localStorage.setItem(getLockID(projectID), value);
  }

  function removeLock(projectID) {
    localStorage.removeItem(getLockID(projectID));
  }

  // Generates a lock on a project if one doesn't exist,
  // or the one that exists has expired. Returns false
  // if a valid lock already existed
  function requestLock(projectID) {
    function acquire() {
      setInterval(acquire, LOCK_EXPIRY_MS);
      setLock(projectID, Date.now().toString());
    }

    var lock = readLock(projectID);
    if (lock) {
      return false;
    }

    acquire();
    return true;
  }

  // Returns the current valid lock, or undefined if there
  // isn't one
  function readLock(projectID) {
    var now = Date.now();
    var lock = Number(getLock(projectID));
    if (lock) {
      // Since the lock expiration is a fallback feature,
      // we add half of the expiry time as a buffer to prevent
      // a race condition that reports the lock as expired by a
      // very small margin
      var threshold = lock + LOCK_EXPIRY_MS;
      if (now > threshold) {
        removeLock(projectID);
        return;
      }
    }

    return lock;
  }

  return {
    requestLock: requestLock,
    readLock: readLock,
    removeLock: removeLock
  };
});
