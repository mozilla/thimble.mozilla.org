define(function(require) {
  var $ = require("jquery"),
      DataProtector = require("fc/dataprotector"),
      Preferences = require("fc/prefs"),
      Editor = require("fc/ui/editor"),
      Modals = require("fc/ui/modals"),
      CurrentPageManager = require("fc/current-page-manager"),
      Publisher = require("fc/publisher"),
      PublishUI = require("fc/ui/publish"),
      ProjectUI = require("fc/ui/bramble-project"),
      DefaultContentTemplate = require("template!default-content"),
      Localized = require("localized"),
      ProjectFiles = require("fc/load-project-files"),
      FileSystemSync = require("fc/filesystem-sync");

  Preferences.fetch();

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
          previewLoader: options.previewLoader,
          dataProtector: DataProtector,
          editorHost: options.editorHost,
          editorUrl: options.editorUrl,
          appUrl: options.appUrl
        }),
        makeDetails = options.makeDetails,
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
      remixURLTemplate: remixURLTemplate,
      makeDetails: makeDetails,
      dataProtector: DataProtector
    });
    var pageManager = CurrentPageManager({
      window: window,
      currentPage: pageToLoad
    });
    ProjectUI.updateMeta(makeDetails);

    function doneLoading() {
      editor.panes.codeMirror.on("loaded", function() {
        editor.container.removeClass("friendlycode-loading");
        editor.panes.codeMirror.clearHistory();
        editor.toolbar.refresh();
        editor.panes.codeMirror.focus();
        editor.panes.codeMirror.refresh();
        DataProtector.disableDataProtection();
        ready.resolve();
      });
    }

    // set up save to automatically save + publish to makeAPI,
    // used in editor-toolbar.js
    editor.toolbar.setStartPublish(publishUI.start(true));

    editor.container.addClass("friendlycode-loading");
    publishUI.on("publish", function(info) {
      // Set the URL to be the new URL to remix the page the user just
      // published, so they can share/bookmark the URL and it'll be what
      // they expect it to be.
      pageManager.changePage(info.path, info.remixURL);

      // Also update the preview pane so that to the title
      // points to the published URL
      editor.panes.preview.setViewLink(info.viewURL);
    });

    // Bramble: Load the project Files into the fs
    var initFs = function(callback) {
      if(!makeDetails || !makeDetails.title) {
        makeDetails = ProjectFiles.generateDefaultProject();
        ProjectFiles.load(makeDetails, defaultContent, callback);
        return;
      }

      ProjectFiles.load(makeDetails, callback);
    };

    FileSystemSync.init(makeDetails && makeDetails.title, {
      createOrUpdate: options.appUrl + "/updateProjectFile"
    }, $("meta[name='csrf-token']").attr("content"));

    if (!pageManager.currentPage()) {
      setTimeout(function() {
        editor.panes.codeMirror.init(defaultContent, initFs);
        doneLoading();
      }, 0);
    } else {
      publisher.loadCode(pageManager.currentPage(), function(err, data, url) {
        if (err) {
          modals.showErrorDialog({
            text: Localized.get('page-load-err')
          });
        } else {
          editor.panes.codeMirror.init(data, initFs);
          publishUI.setCurrentURL(url);
          doneLoading();
        }
      });
    }

    return {
      editor: editor,
      codeMirror: editor.panes.codeMirror,
      publishUI: publishUI,
      ready: ready
    };
  };
});
