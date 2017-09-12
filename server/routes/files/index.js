var read = require("./read");

module.exports = {
  init: function(app, middleware, config) {
    // Get all file data for a project
    app.get(
      "/projects/:projectId?/files/data",
      middleware.setUserIfTokenExists,
      read.data.bind(app, config)
    );

    // Get the file data for a given file id
    app.get(
      "/files/:fileId",
      middleware.setErrorMessage("errorGettingProjectFiles"),
      middleware.checkForAuth,
      middleware.setUserIfTokenExists,
      read.file.bind(app, config)
    );

    // Get all file metadata for a project
    app.get(
      "/projects/:projectId?/files/meta",
      middleware.setErrorMessage("errorGettingProjectFiles"),
      middleware.checkForAuth,
      middleware.setUserIfTokenExists,
      read.metadata.bind(app, config)
    );

    // Create or update a file for a project for a user
    app.put(
      "/projects/:projectId/files/:fileId?",
      middleware.setErrorMessage(function(request) {
        return request.params.fileId
          ? "errorUpdatingFile"
          : "errorCreatingFile";
      }),
      middleware.checkForAuth,
      middleware.setUserIfTokenExists,
      middleware.fileUpload,
      middleware.validateRequest(["bramblePath"]),
      middleware.setProject,
      require("./create-update").bind(app, config)
    );

    // Delete a file for a project for a user
    app["delete"](
      "/projects/:projectId/files/:fileId",
      middleware.setErrorMessage("errorDeletingFile"),
      middleware.checkForAuth,
      middleware.setUserIfTokenExists,
      middleware.setProject,
      require("./delete").bind(app, config)
    );
  }
};
