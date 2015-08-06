define(function() {

  function _onbeforeunload(e) {
    var s = "Syncing in progress...";
    var e = e || window.event;

    if(e) {
      e.returnValue = s;
    }

    return s;
  }

  function enable() {
    window.onbeforeunload = _onbeforeunload;
  }

  function disable() {
    window.onbeforeunload = null;
  }

  return {
    enable: enable,
    disable: disable
  };
});
