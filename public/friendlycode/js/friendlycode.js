define(function(require) {
  var $ = require("jquery"),
      DataProtector = require("fc/dataprotector"),
      Preferences = require("fc/prefs"),
      Editor = require("fc/ui/editor"),
      Modals = require("fc/ui/modals"),
      CurrentPageManager = require("fc/current-page-manager"),
      Publisher = require("fc/publisher"),
      PublishUI = require("fc/ui/publish"),
      DefaultContentTemplate = require("template!default-content"),
      Localized = require("localized");

  Preferences.fetch();

  // turn on data protection so users can't reload/leave accidentally
  DataProtector.enableDataProtection();

  return function FriendlycodeEditor(options) {
    var publishURL = options.publishURL,
        pageToLoad = options.pageToLoad,
        defaultContent = options.defaultContent || DefaultContentTemplate(),
        remixURLTemplate = options.remixURLTemplate ||
          location.protocol + "//" + location.host +
          location.pathname + "#{{VIEW_URL}}",
        editor = Editor({
          container: options.container,
          allowJS: options.allowJS,
          previewLoader: options.previewLoader
        }),
        ready = $.Deferred();

    var modals = Modals({
      container: $('<div class="friendlycode-base"></div>')
        .appendTo(document.body)
    });
    var publisher = options.publisher || Publisher(publishURL);
    var publishUI = PublishUI({
      modals: modals,
      codeMirror: editor.panes.codeMirror,
      publisher: publisher,
      remixURLTemplate: remixURLTemplate
    });
    var pageManager = CurrentPageManager({
      window: window,
      currentPage: pageToLoad
    });

    function doneLoading() {
      editor.container.removeClass("friendlycode-loading");
      editor.panes.codeMirror.clearHistory();
      editor.toolbar.refresh();
      editor.panes.codeMirror.reparse();
      editor.panes.codeMirror.focus();
      editor.panes.codeMirror.refresh();
      ready.resolve();
    }

    editor.toolbar.setStartPublish(publishUI.start);
    editor.container.addClass("friendlycode-loading");
    publishUI.on("publish", function(info) {
      // Set the URL to be the new URL to remix the page the user just
      // published, so they can share/bookmark the URL and it'll be what
      // they expect it to be.
      pageManager.changePage(info.path, info.remixURL);

      // Also update the preview pane so that to the title
      // points to the published URL
      editor.panes.preview.setTitleLink(info.viewURL);
    });

    if (!pageManager.currentPage()) {
      setTimeout(function() {
        editor.panes.codeMirror.setValue(defaultContent);
        doneLoading();
      }, 0);
    } else
      publisher.loadCode(pageManager.currentPage(), function(err, data, url) {
        if (err) {
          modals.showErrorDialog({
            text: Localized.get('page-load-err')
          });
        } else {
          editor.panes.codeMirror.setValue(data);
          publishUI.setCurrentURL(url);
          doneLoading();
        }
      });

    return {
      editor: editor,
      codeMirror: editor.panes.codeMirror,
      publishUI: publishUI,
      ready: ready
    };
  };
});
