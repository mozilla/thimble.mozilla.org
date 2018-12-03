module.exports = {
  init(app, middleware, config) {
    // Start exporting a project
    app.post(
      "/projects/:projectId/export/start",
      middleware.checkForAuth,
      middleware.setUserIfTokenExists,
      require("./start").project.bind(app, config)
    );

    // Export the metadata for a project
    app.get(
      "/projects/:projectId/export/metadata",
      middleware.setExportToken,
      require("./metadata").project.bind(app, config)
    );

    // Export the data for a project
    app.get(
      "/projects/:projectId/export/data",
      middleware.setExportToken,
      require("./data").project.bind(app, config)
    );

    // Finish exporting a project
    app.put(
      "/projects/:projectId/export/finish",
      middleware.setExportToken,
      require("./finish").project.bind(app, config)
    );

    // Start exporting a published project
    app.post(
      "/publishedprojects/:publishedProjectId/export/start",
      middleware.checkForAuth,
      middleware.setUserIfTokenExists,
      require("./start").publishedProject.bind(app, config)
    );

    // Export the metadata for a published project
    app.get(
      "/publishedprojects/:publishedProjectId/export/metadata",
      middleware.setExportToken,
      require("./metadata").publishedProject.bind(app, config)
    );

    // Export the data for a published project
    app.get(
      "/publishedprojects/:publishedProjectId/export/data",
      middleware.setExportToken,
      require("./data").publishedProject.bind(app, config)
    );

    // Finish exporting a published project
    app.put(
      "/publishedprojects/:publishedProjectId/export/finish",
      middleware.setExportToken,
      require("./finish").publishedProject.bind(app, config)
    );
  }
};
