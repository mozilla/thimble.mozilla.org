// This manages the UI for undo/redo.
define(function() {
  "use strict";

  var analytics = require("analytics");

  return function HistoryUI(options) {
    var undo = options.undo;
    var redo = options.redo;
    var codeMirror = options.codeMirror;

    function refreshButtons() {
      var history = 0;
      undo.toggleClass("enabled", history.undo === 0 ? false : true);
      redo.toggleClass("enabled", history.redo === 0 ? false : true);
    }

    undo.click(function() {
      analytics.event("Undo");
      codeMirror.undo();
      refreshButtons();
    });
    redo.click(function() {
      analytics.event("Redo");
      codeMirror.redo();
      refreshButtons();
    });
    codeMirror.on("change", refreshButtons);
    refreshButtons();
    return {refresh: refreshButtons};
  };
});
