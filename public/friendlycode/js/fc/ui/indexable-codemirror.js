"use strict";

// A subclass of CodeMirror which adds a few methods that make it easier
// to work with character indexes rather than {line, ch} objects.
define(["codemirror"], function(CodeMirror) {
  return function IndexableCodeMirror(place, givenOptions) {
    var codeMirror = CodeMirror(place, givenOptions);

    // add autocomplete
    CodeMirror.commands.autocomplete = function(cm) {
      // "javascript", "html" and "css" are supported
      var mode = CodeMirror.hint[CodeMirror.hint.currentMode];
      if(mode) {
        CodeMirror.showHint(cm, mode);
      }
    };

    // autocomplete default mode
    CodeMirror.hint.currentMode = "html";

    // Returns the character index of the cursor position.
    codeMirror.getCursorIndex = function() {
      return codeMirror.indexFromPos(codeMirror.getCursor());
    };

    return codeMirror;
  };
});
