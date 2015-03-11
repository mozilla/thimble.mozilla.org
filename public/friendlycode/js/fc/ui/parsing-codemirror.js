// A subclass of IndexableCodeMirror which continuously re-parses
// the code in its editor. Also adds a Backbone.Events interface
// for extension points to hook into.
define([
  "./bramble-proxy",
  "./URLProxy",
  "jquery"
], function(CodeMirrorProxy, URLProxy, $) {
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

      // If the user is not logged in, we don't do any link proxying.
      // Instead, we notify them that their resources are http-on-https.
      if (!$("html").hasClass("loggedin") && result.warnings) {
        result.error = result.warnings[0].parseInfo;
        result.warnings = [];
      }

      // handle (possible) warnings (these do not lead to a "bad" make)
      // as well as (possible) errors (these will lead to a "bad" make).
      URLProxy.proxyURLs(sourceCode, result.warnings, function(sourceCode) {
        // The `signal` method here is a stub of CodeMirror's
        // signal method. It no longer passes the instance
        // as the first parameter on events that expect it
        CodeMirrorProxy.signal(codeMirror, "reparse", {
          error: result.error,
          sourceCode: sourceCode,
          document: result.document
        });
      });
    }

    // The number of milliseconds to wait before re-parsing the editor
    // content.
    var parseDelay = givenOptions.parseDelay || 300;
    var time = givenOptions.time || window;
    var reparseTimeout;

    // This isn't actually CodeMirror. CodeMirror
    // lives in brackets now, so we've added
    // a proxy layer to allow this code to (mostly)
    // remain unchanged. See "bramble-proxy.js"
    var codeMirror = new CodeMirrorProxy(place, givenOptions);

    codeMirror.on("change", function(event) {
      if (reparseTimeout !== undefined) {
        time.clearTimeout(reparseTimeout);
      }
      if (codeMirror.reparseEnabled) {
        reparseTimeout = time.setTimeout(reparse, parseDelay);
      }

      if (codeMirror.getValue().match(/<\/script\s*\>/i)) {
        $("#run-js-opt").removeClass('hide-run-js');
      } else {
        $("#run-js-opt").addClass('hide-run-js');
      }
      // On changes to the code editor, signal that we need
      // accidental page-navigation protection again.
      dataProtector.enableDataProtection();
    });

    codeMirror.reparse = reparse;
    codeMirror.reparseEnabled = true;
    return codeMirror;
  };
});
