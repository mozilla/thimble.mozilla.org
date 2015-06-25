define(function(require) {
  var $ = require("jquery"),
      CodeMirror = require("fc/ui/bramble-proxy"),
      Help = require("fc/help");

  return function EditorPanes(options) {
    var self = {},
        div = options.container,
        initialValue = options.value || "",
        allowJS = options.allowJS || false,
        editor = $('<div class="source-code"></div>').attr('id','webmaker-source-code-pane').appendTo(div);

    // This is not an actual codemirror instance. See: bramble-proxy.js
    var codeMirror = self.codeMirror = new CodeMirror(editor, {
      editorHost: options.editorHost,
      editorUrl: options.editorUrl,
      appUrl: options.appUrl,
      source: initialValue
    });

    return self;
  };
});
