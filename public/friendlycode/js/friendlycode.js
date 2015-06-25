define(function(require) {
  var $ = require("jquery"),
      Editor = require("fc/ui/editor"),
      ProjectUI = require("fc/ui/bramble-project"),
      DefaultContentTemplate = require("template!default-content"),
      Localized = require("localized"),
      ProjectFiles = require("fc/load-project-files"),
      FileSystemSync = require("fc/filesystem-sync");

  return function FriendlycodeEditor(options) {
    var defaultContent = options.defaultContent || DefaultContentTemplate(),
        editor = new Editor({
          container: options.container,
          editorHost: options.editorHost,
          editorUrl: options.editorUrl
        }),
        makeDetails = options.makeDetails;

    ProjectUI.updateMeta(makeDetails);

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

    editor.init({ sync: fsync }, initFs);
  };
});
