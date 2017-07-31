/**
 * Manage a warning on application close depending on whether we're
 * currently syncing (file sync or publish) with the server or not.
 */

var EventEmitter = require("wolfy87-eventemitter");
var SyncState = new EventEmitter();

function _onbeforeunload(e) {
  var s = "{{ windowCloseFileSavingIndicator }}";
  var e = e || window.event;

  if(e) {
    e.returnValue = s;
  }

  return s;
}

SyncState.isSyncing = function() {
  return !!window.onbeforeunload;
};

SyncState.syncing = function() {
  window.onbeforeunload = _onbeforeunload;
  SyncState.trigger("syncing");
};

SyncState.completed = function() {
  window.onbeforeunload = null;
  SyncState.trigger("completed");
};

module.exports = SyncState;
