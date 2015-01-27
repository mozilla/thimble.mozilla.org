define(function(require) {
  var $ = require("jquery"),
      Slowparse = require("slowparse/slowparse"),
      ParsingCodeMirror = require("fc/ui/parsing-codemirror"),
      Help = require("fc/help");

  require('slowparse-errors');

  return function EditorPanes(options) {
    var self = {},
        div = options.container,
        initialValue = options.value || "(none)",
        allowJS = options.allowJS || false,
        editor = $('<div class="source-code"></div>').attr('id','webmaker-source-code-pane').appendTo(div);

    // This is not an actual codemirror instance. See: bramble-proxy.js
    var codeMirror = self.codeMirror = ParsingCodeMirror(editor, {
      parse: function(html) {
        return Slowparse.HTML(document, html, {
          disallowActiveAttributes: true
        });
      },
      dataProtector: options.dataProtector,
      appUrl: options.appUrl,
      source: initialValue
    });

    return self;
  };
});
