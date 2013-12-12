"use strict";

// A subclass of IndexableCodeMirror which continuously re-parses
// the code in its editor. Also adds a Backbone.Events interface
// for extension points to hook into.
define([
  "backbone-events",
  "./indexable-codemirror"
], function(BackboneEvents, IndexableCodeMirror) {

  return function ParsingCodeMirror(place, givenOptions) {

    // The number of milliseconds to wait before re-parsing the editor
    // content.
    var parseDelay = givenOptions.parseDelay || 300;
    var time = givenOptions.time || window;
    var reparseTimeout;
    var codeMirror = IndexableCodeMirror(place, givenOptions);

    // Called whenever content of the editor area changes.
    function reparse() {
      var sourceCode = codeMirror.getValue();
      var result = givenOptions.parse(sourceCode);
      var curPos = codeMirror.getCursor();

      // Errors cannot occur based on user input while the cursor
      // sits on line 0, column 0, as any kind of typing will move
      // the cursor to a non-zero position.
      if (result.error && curPos.line === 0 && curPos.ch === 0) {

        // If we see an error on 0/0, the error is actually somewhere
        // else in the document, and we need to move the cursor to
        // the end of the erroneous code first.
        var index = 0;

        // Find correct cursor position based on slowparse-signalled HTML errors
        if(result.error.closeTag) {
          index = result.error.closeTag.end;
        }
        else if(result.error.openTag) {
          index = result.error.openTag.start;
        }

        // Find correct cursor position based on slowparse-signalled CSS errors
        else if(result.error.cssValue) {
          index = result.error.cssValue.start;
        }

        codeMirror.setCursor(codeMirror.posFromIndex(index));
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

    // See details-form.js for where this event is thrown
    codeMirror.on("title-update", function(evt) {
      var title = evt.title,
          content = codeMirror.getValue(),
          updated = content.replace(/(title[^>]*)>([^<]+)</, "$1>"+title+"<");
      codeMirror.setValue(updated);
    });


    codeMirror.reparse = reparse;
    codeMirror.reparseEnabled = true;
    return codeMirror;
  };
});
