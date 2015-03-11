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

    // This isn't actually CodeMirror. CodeMirror
    // lives in brackets now, so we've added
    // a proxy layer to allow this code to (mostly)
    // remain unchanged. See "bramble-proxy.js"
    var codeMirror = new CodeMirrorProxy(place, givenOptions);

    codeMirror.on("change", function(event) {
      if (codeMirror.getValue().match(/<\/script\s*\>/i)) {
        $("#run-js-opt").removeClass('hide-run-js');
      } else {
        $("#run-js-opt").addClass('hide-run-js');
      }
      // On changes to the code editor, signal that we need
      // accidental page-navigation protection again.
      dataProtector.enableDataProtection();
    });

    return codeMirror;
  };
});
