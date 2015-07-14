define(function(require) {
  var $ = require("jquery"),
      Editor = require("fc/ui/editor"),
      ProjectUI = require("fc/ui/bramble-project"),
      defaultContentTemplate = require("template!default-content"),
      ProjectFiles = require("fc/load-project-files"),
      FileSystemSync = require("fc/filesystem-sync");

  return function FriendlycodeEditor(options) {
    var defaultContent = options.defaultContent || defaultContentTemplate(),
        editor = new Editor({
          container: options.container,
          editorHost: options.editorHost,
          editorUrl: options.editorUrl,
          appUrl: options.appUrl
        }),
        makeDetails = options.makeDetails,
        username = $("#ssooverride").attr("data-oauth-username");

    ProjectUI.updateMeta(makeDetails);

    // Bramble: Load the project Files into the fs
    var initFs = function(callback) {
      if(!makeDetails || !makeDetails.title) {
        makeDetails = ProjectFiles.generateDefaultProject();
        ProjectFiles.load(makeDetails, { defaultTemplate: defaultContent }, callback);
        return;
      }

      if(makeDetails.isNew) {
        makeDetails = ProjectFiles.generateDefaultProject(makeDetails.title, makeDetails.root);
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

    editor.init({
      sync: fsync,
      project: makeDetails,
      appUrl: options.appUrl,
      authenticated: !!username,
    }, initFs);
  };
});
