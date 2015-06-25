define(function(require) {
  var $ = require("jquery"),
      DataProtector = require("fc/dataprotector"),
      Editor = require("fc/ui/editor"),
      Modals = require("fc/ui/modals"),
      ProjectUI = require("fc/ui/bramble-project"),
      DefaultContentTemplate = require("template!default-content"),
      Localized = require("localized"),
      ProjectFiles = require("fc/load-project-files"),
      FileSystemSync = require("fc/filesystem-sync");

  return function FriendlycodeEditor(options) {
    var defaultContent = options.defaultContent || DefaultContentTemplate(),
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

    editor.container.addClass("friendlycode-loading");

    // Bramble: Load the project Files into the fs
    var initFs = function(callback) {
      if(!makeDetails || !makeDetails.title) {
        makeDetails = ProjectFiles.generateDefaultProject();
        ProjectFiles.load(makeDetails, { defaultTemplate: defaultContent }, callback);
        return;
      }

      if(makeDetails.isNew) {
        makeDetails = ProjectFiles.generateDefaultProject(makeDetails.title);
        ProjectFiles.load(makeDetails, {
          isNew: true,
          defaultTemplate: defaultContent,
          csrfToken: $("meta[name='csrf-token']").attr("content"),
          persistenceURL: options.appUrl + "/updateProjectFile"
        }, callback);
        return;
      }

      ProjectFiles.load(makeDetails, callback);
    };

    var fsync = FileSystemSync.init(makeDetails && makeDetails.title, {
      createOrUpdate: options.appUrl + "/updateProjectFile",
      del: options.appUrl + "/deleteProjectFile"
    }, $("meta[name='csrf-token']").attr("content"));

    editor.panes.codeMirror.init({ sync: fsync }, initFs);
    doneLoading();

    return {
      editor: editor,
      codeMirror: editor.panes.codeMirror,
      ready: ready
    };
  };
});
