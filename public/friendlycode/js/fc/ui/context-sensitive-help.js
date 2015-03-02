// Provides context-sensitive help for a ParsingCodeMirror based on
// the current cursor position.
define([
  "jquery",
  "fc/prefs",
  "./mark-tracker"
], function($, Preferences, markTracker) {
  "use strict";

  return function ContextSensitiveHelp(options) {
    var self = {};
    var codeMirror = options.codeMirror;
    var template = options.template;
    var helpArea = options.helpArea;
    var relocator = options.relocator;
    var helpIndex = options.helpIndex;
    var lastEvent = null;
    var timeout = null;
    var lastHelp = null;
    var HELP_DISPLAY_DELAY = 250;

    function clearHelp() {
      clearTimeout(timeout);
      lastHelp = null;
      cursorHelpMarks.clear();
      helpArea.addClass("hidden");
      relocator.cleanup();
    }

    // The escape key should close hints
    $(document).keyup(function(event) {
      if (event.keyCode == 27)
        clearHelp();
    });

    var cursorHelpMarks = markTracker(codeMirror);

    codeMirror.on("reparse", function(event) {
      clearHelp();
      lastEvent = event;
      helpIndex.clear();
      if (!event.error)
        helpIndex.build(event.document, event.sourceCode);
    });

    function showHelp(cursorIndex, help) {
      cursorHelpMarks.clear();

      if (help.type == "cssSelector") {
        // TODO: Because we're looking at the generated document fragment and
        // not an actual HTML document, implied elements like <body> may not
        // be captured here.
        var selector = help.highlights[0].value;
        try {
          var matches = lastEvent.document.querySelectorAll(selector);
          help.matchCount = matches.length;
        } catch (e) {
          // if the selector throws, it's because if an "impossible" selector
          // like "@font-face" or a keyframes "0%". In this case, we simply
          // ignore the throw, because we shouldn't try to place help info.
          return;
        }
      }

      var oldOffset = helpArea.offset();
      helpArea.html(template(help)).removeClass("hidden");
      var startMark = null,
          endMark = null;
      help.highlights.forEach(function(interval) {
        var start = interval.start,
            end = interval.end;
        // Show the help message closest to the highlight that
        // encloses the current cursor position.
        if (start <= cursorIndex && end >= cursorIndex) {
          startMark = start;
          endMark = end;
        }
        cursorHelpMarks.mark(start, end, "cursor-help-highlight");
      });
      if (startMark !== null) {
        relocator.relocate(helpArea, startMark, endMark, "help");
        var newOffset = helpArea.offset();
        if (newOffset.top != oldOffset.top ||
            newOffset.left != oldOffset.left) {
          helpArea.addClass("hidden");
          helpArea.fadeIn();
        }
      }
      // clicking the dismiss link should also close error help
      var dismiss = helpArea.find(".dismiss");
      if(dismiss) {
        dismiss.click(clearHelp);
      }
    }

    codeMirror.on("change", clearHelp);
    codeMirror.on("cursor-activity", function() {
      clearTimeout(timeout);

      if (Preferences.get("showHints") === false)
        return;

      // If the editor widget doesn't have input focus, this event
      // was likely triggered through some programmatic manipulation rather
      // than manual cursor movement, so don't bother displaying a hint.
      if (!$(codeMirror.getWrapperElement()).hasClass("CodeMirror-focused"))
        return;

      var cursorIndex = codeMirror.getCursorIndex();
      var help = helpIndex.get(cursorIndex);

      if (JSON.stringify(help) == lastHelp)
        return;

      clearHelp();
      // same as error-help.js, "reparse" handler
      if (help) {
        timeout = setTimeout(function() {
          lastHelp = JSON.stringify(help);
          showHelp(cursorIndex, help);
        }, HELP_DISPLAY_DELAY);
      }
    });

    // XXX - TODO: Hook preferences up with brackets iframe
    Preferences.on("change:showHints", function() {
      if (Preferences.get("showHints") === false)
        clearHelp();
    });

    Preferences.trigger("change:showHints");
    return self;
  };
});
