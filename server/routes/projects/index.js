module.exports = {
  init: function(app, middleware, config) {
    // Get all projects for a user
    app.get(
      "/projects",
      middleware.setErrorMessage("errorGettingProjectList"),
      middleware.checkForAuth,
      middleware.setUserIfTokenExists,
      middleware.setPublishUser,
      require("./read").bind(app, config)
    );

    // Create a new project for a user
    app.get(
      "/projects/new",
      middleware.setErrorMessage("errorCreatingProject"),
      middleware.setUserIfTokenExists,
      middleware.setPublishUser,
      require("./create").bind(app, config)
    );

    // Update project metadata for a user
    app.put(
      "/projects/:projectId",
      middleware.setErrorMessage("errorUpdatingProject"),
      middleware.checkForAuth,
      middleware.setUserIfTokenExists,
      middleware.setPublishUser,
      middleware.setProject,
      middleware.validateRequest(["title", "dateCreated", "dateUpdated"]),
      require("./update").bind(app, config)
    );

    // Delete a project for a user
    app["delete"](
      "/projects/:projectId",
      middleware.setErrorMessage("errorDeletingProject"),
      middleware.checkForAuth,
      middleware.setUserIfTokenExists,
      require("./delete").bind(app, config)
    );

    // Rename a project for a user
    app.put(
      "/projects/:projectId/rename",
      middleware.setErrorMessage("errorRenamingProject"),
      middleware.checkForAuth,
      middleware.setUserIfTokenExists,
      middleware.setProject,
      middleware.validateRequest(["title"]),
      require("./rename").bind(app, config)
    );

    // Rename a folder in a project
    app.put(
      "/projects/:projectId/renamefolder",
      middleware.setErrorMessage("errorRenamingProjectFolder"),
      middleware.checkForAuth,
      middleware.setUserIfTokenExists,
      middleware.setProject,
      middleware.validateRequest(["paths", "dateUpdated"]),
      require("./rename-folder").bind(app, config)
    );

    // Publish an existing project for a user
    app.put(
      "/projects/:projectId/publish",
      middleware.setErrorMessage("errorPublishingProject"),
      middleware.checkForAuth,
      middleware.setUserIfTokenExists,
      middleware.setProject,
      middleware.validateRequest(["description", "dateUpdated", "public"]),
      require("./publish").bind(app, config)
    );

    // Unpublish an existing project for a user
    app.put(
      "/projects/:projectId/unpublish",
      middleware.setErrorMessage("errorUnpublishingProject"),
      middleware.checkForAuth,
      middleware.setUserIfTokenExists,
      middleware.setProject,
      middleware.validateRequest(["description", "dateUpdated", "public"]),
      require("./unpublish").bind(app, config)
    );

    // Remix an existing project
    app.get(
      "/projects/:publishedId/remix",
      middleware.setErrorMessage("errorRemixingProject"),
      middleware.setUserIfTokenExists,
      middleware.setPublishUser,
      require("./remix").bind(app, config)
    );

    // Project Remix Bar HTML fragment to be injected inot a published project
    app.get(
      "/projects/remix-bar",
      middleware.enableCORS(config.publishedProjectsHostname),
      require("./remix-bar").bind(app, config)
    );
  }
};
