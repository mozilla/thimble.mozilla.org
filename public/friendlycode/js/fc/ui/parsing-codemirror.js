"use strict";

// A subclass of IndexableCodeMirror which continuously re-parses
// the code in its editor. Also adds a Backbone.Events interface
// for extension points to hook into.
define([
  "backbone-events",
  "./indexable-codemirror"
], function(BackboneEvents, IndexableCodeMirror) {
  return function ParsingCodeMirror(place, givenOptions) {
    // Called whenever content of the editor area changes.
    function reparse() {
      var sourceCode = codeMirror.getValue();
      var result = givenOptions.parse(sourceCode);
      CodeMirror.signal(codeMirror, "reparse", {
        error: result.error,
        sourceCode: sourceCode,
        document: result.document
      });
      // Cursor activity would've been fired before us, so call it again
      // to make sure it displays the right context-sensitive help based
      // on the new state of the document.
      CodeMirror.signal(codeMirror, "cursor-activity");
    }

    // The number of milliseconds to wait before re-parsing the editor
    // content.
    var parseDelay = givenOptions.parseDelay || 300;
    var time = givenOptions.time || window;
    var reparseTimeout;

    var codeMirror = IndexableCodeMirror(place, givenOptions);

    codeMirror.on("change", function(cm, event) {
      if (reparseTimeout !== undefined) {
        time.clearTimeout(reparseTimeout);
      }
      if (codeMirror.reparseEnabled) {
        reparseTimeout = time.setTimeout(reparse, parseDelay);
      }
    });

    codeMirror.on("cursorActivity", function(cm, activity) {
      CodeMirror.signal(codeMirror, "cursor-activity");
    });

    codeMirror.reparse = reparse;
    codeMirror.reparseEnabled = true;
    return codeMirror;
  };
});
