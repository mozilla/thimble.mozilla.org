// Displays the HTML source of a CodeMirror editor as a rendered preview
// in an iframe.
define(["jquery", "backbone-events", "./mark-tracker"], function($, BackboneEvents, markTracker) {
  "use strict";

  function LivePreview(options) {
    var self = {codeMirror: options.codeMirror, title: ""},
        codeMirror = options.codeMirror,
        iframe = document.createElement("iframe"),
        previewLoader = options.previewLoader || "/templates/previewloader.html",
        previewArea = options.previewArea,
        telegraph,
        knownDoc,
        marks = markTracker(codeMirror);

    // set up the iframe so that it always triggers an initial
    // content injection by telling codemirror to reparse on load:
    iframe.onload = function() {
      codeMirror.reparse();
    };

    // then set up the preview load from URL
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
          // record current doc
          knownDoc = event.document;

          // targetOrigin is current a blanket allow, we'll want to
          // narrow it down once scripts in Thimble are operational.
          // See: https://bugzilla.mozilla.org/show_bug.cgi?id=891521
          telegraph.postMessage(message, "*");

        } catch (e) {
          console.log("An error occurred while postMessaging data to the preview pane");
          throw e;
        }

      }
    });

    var setViewLink = self.setViewLink = function(link) {
      self.trigger("change:viewlink", link);
    };

    // map-back from preview to codemirror
    window.addEventListener("message", function(evt) {
      var d = JSON.parse(evt.data);
      if (d.type !== "previewloader:click") return;
      marks.clear();
      var route = d.route;
      if(route.length > 0) {
        var e = knownDoc.querySelector("body");
        while(route.length > 0) {
          e = e.childNodes[route.splice(0,1)[0]];
        }
        var start = e.parseInfo.openTag.start,
            end = e.parseInfo.closeTag.end;
        marks.mark(start, end, "preview-to-editor-highlight");
        codeMirror.scrollIntoView(codeMirror.posFromIndex(start));
      }
    });


    BackboneEvents.mixin(self);
    return self;
  }

  return LivePreview;
});
