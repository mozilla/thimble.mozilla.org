// Displays the HTML source of a CodeMirror editor as a rendered preview
// in an iframe.
define(["jquery", "backbone-events"], function($, BackboneEvents) {
  "use strict";

  function LivePreview(options) {
    var self = {codeMirror: options.codeMirror, title: ""},
        codeMirror = options.codeMirror,
        iframe = document.createElement("iframe"),
        previewLoader = options.previewLoader || "/templates/previewloader.html",
        previewArea = options.previewArea,
        telegraph;

    // set up the loader script for the preview iframe
    iframe.src = previewLoader;

    // set up the code-change handling.
    codeMirror.on("reparse", function(event) {
      if (!event.error || options.ignoreErrors) {
        // add the preview iframe to the editor on the first
        // attempt to parse the Code Mirror text
        if(!iframe.contentWindow) {
          previewArea.append(iframe);
          telegraph = iframe.contentWindow;
        }

        // Communicate content changes. For the moment,
        // we treat all changes as a full refresh.
        var message = JSON.stringify({
          type: "overwrite",
          sourceCode: event.sourceCode
        });

        try {
          // targetOrigin is current a blanket allow, we'll want to
          // narrow it down once scripts in Thimble are operational.
          // See: https://bugzilla.mozilla.org/show_bug.cgi?id=891521
          telegraph.postMessage(message, "*");
        } catch (e) {
          console.log("An error occurred while postMessaging data to the preview pane");
          throw e;
        }

        // check if we need to update the title for the live preview pane
        var titleMatch = event.sourceCode.match(/<[tT][iI][tT][lL][eE][^>]*>([^<]*)<\/[tT][iI][tT][lL][eE]>/),
            title = (titleMatch ? titleMatch[1] : false);
        if (title != self.title) {
          self.title = title;
          self.trigger("change:title", self.title);
        }
      }
    });

    BackboneEvents.mixin(self);
    return self;
  };

  return LivePreview;
});
