// A subclass of IndexableCodeMirror which continuously re-parses
// the code in its editor. Also adds a Backbone.Events interface
// for extension points to hook into.
define([
  "backbone-events",
  "./indexable-codemirror"
], function(BackboneEvents, indexableCodeMirror) {
  "use strict";

  return function ParsingCodeMirror(place, givenOptions) {
    var dataProtector = givenOptions.dataProtector;

    // Called whenever content of the editor area changes.
    function reparse() {
      var sourceCode = codeMirror.getValue();
      var result = givenOptions.parse(sourceCode);
      var curPos = codeMirror.getCursor();

      if (result.error) {
        if (!result.error.cursor) {
          // This should, ideally, never happen. But it might, so tell the user
          // what's wrong so they can include that information in a bug report.
          console.error("Friendlycode could not find the cursor location "+
                        " associated with an error. Error:", result.error);
        }
        // If this is a clean load, or a full document paste, we need to
        // put the cursor in a "real" place before we can add the error dialog.
        var line = curPos.line;
        if (curPos.ch === 0 && (line === 0 || line === codeMirror.lastLine())) {
          var index = result.error.cursor || 0;
          curPos = codeMirror.posFromIndex(index);
          codeMirror.setCursor(curPos);
        }
      }

      // For autocomplete purposes, figure out which mode the document
      // is in, at the current cursor position, so that ctrl-space will
      // use the correct autocomplete wordlist.
      if (CodeMirror.hint) {
        var cpos = codeMirror.indexFromPos(codeMirror.getCursor()),
            marker = false;
        result.contexts.forEach(function(ctx) {
          if(ctx.position <= cpos) {
            marker = ctx;
          }
        });
        if (marker) {
          CodeMirror.hint.currentMode = marker.context;
        }
      }

      // handle (possible) errors
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

    var codeMirror = indexableCodeMirror(place, givenOptions);

    codeMirror.on("change", function(cm, event) {
      if (reparseTimeout !== undefined) {
        time.clearTimeout(reparseTimeout);
      }
      if (codeMirror.reparseEnabled) {
        reparseTimeout = time.setTimeout(reparse, parseDelay);
      }
      // On changes to the code editor, signal that we need
      // accidental page-navigation protection again.
      dataProtector.enableDataProtection();
    });

    codeMirror.on("cursorActivity", function(cm, activity) {
      CodeMirror.signal(codeMirror, "cursor-activity");
    });

    codeMirror.reparse = reparse;
    codeMirror.reparseEnabled = true;
    return codeMirror;
  };
});
