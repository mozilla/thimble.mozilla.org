define(function() {

  var _registeredFns = {
    syncing: [],
    completed: []
  };

  function _onbeforeunload(e) {
    var s = "Sync in progress...";
    var e = e || window.event;

    if(e) {
      e.returnValue = s;
    }

    return s;
  }

  function _trigger(type) {
    _registeredFns[type].forEach(function(fn) { fn(); });
  }

  function isSyncing() {
    return !!window.onbeforeunload;
  }

  function onSyncing(fn) {
    _registeredFns.syncing.push(fn);
  }

  function syncing() {
    window.onbeforeunload = _onbeforeunload;
    _trigger("syncing");
  }

  function completed() {
    window.onbeforeunload = null;
    _trigger("completed");
  }

  function onCompleted(fn) {
    _registeredFns.completed.push(fn);
  }

  return {
    isSyncing: isSyncing,
    syncing: syncing,
    onSyncing: onSyncing,
    completed: completed,
    onCompleted: onCompleted
  };
});
