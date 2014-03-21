// A subclass of IndexableCodeMirror which continuously re-parses
// the code in its editor. Also adds a Backbone.Events interface
// for extension points to hook into.
define([
  "backbone-events",
  "./indexable-codemirror",
  "./URLproxy"
], function(BackboneEvents, indexableCodeMirror, URLProxy) {
  "use strict";

  /**
   * Our wrapper for codemirror that adds in sourcecode parsing before sending
   * that code on for live-previewing in the live-preview.js file.
   */
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

      /**
       * Route finder for the slowparse-generated document
       */
      var findElementRoute = (function generateFindElementRoute(fragment) {
        var html = false;
        if(fragment.children && fragment.children[0]) {
          html = fragment.children[0];
        }
        if(!html) return false;

        var _findElement = function _findElement(element, position) {
          var pi = element.parseInfo,
              ot = pi.openTag,
              ct = pi.closeTag,
              range = {
                begin: ot.start,
                end: ct ? ct.end : ot.end
              };
          return (position >= range.begin && position <= range.end);
        };

        var _findElementRoute = function _findElementRoute(element, position) {
          var route = [];
          var children = Array.prototype.slice.call(element.children);
          for(var i=0, last=children.length, node; i<last; i++) {
            node = children[i];
            if (_findElement(node, position)) {
              route.push(i);
              route = route.concat(_findElementRoute(node, position));
            }
          }
          return route;
        };

        return function(position) {
          return _findElementRoute(html, position);
        };
      }(result.document));

      // If the user is not logged in, we don't do any link proxying.
      // Instead, we notify them that their resources are http-on-https.
      if (!$("html").hasClass("loggedin") && result.warnings) {
        result.error = result.warnings[0].parseInfo;
        result.warnings = [];
      }

      // handle (possible) warnings (these do not lead to a "bad" make)
      // as well as (possible) errors (these will lead to a "bad" make).
      URLProxy.proxyURLs(sourceCode, result.warnings, function(sourceCode) {
        CodeMirror.signal(codeMirror, "reparse", {
          error: result.error,
          sourceCode: sourceCode,
          document: result.document,
          findElementRoute: findElementRoute
        });
      });

      // Cursor activity would have been fired before us, so call it again
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
