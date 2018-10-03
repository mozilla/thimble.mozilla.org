const Security = require("../../security");
const config = require("../config");

module.exports = {
  init: function(app, middleware, config) {
    // Home page for the application
    app.get(
      "/",
      middleware.clearRedirects,
      middleware.setUserIfTokenExists,
      require("./homepage").bind(app, config)
    );

    // Features page
    app.get(
      "/features",
      middleware.clearRedirects,
      middleware.setUserIfTokenExists,
      require("./features").bind(app, config)
    );

    // Get Involved page
    app.get(
      "/get-involved",
      middleware.clearRedirects,
      middleware.setUserIfTokenExists,
      require("./get-involved").bind(app, config)
    );

    // Moving to Glitch page
    app.get(
      "/moving-to-glitch",
      middleware.clearRedirects,
      middleware.setUserIfTokenExists,
      require("./moving-to-glitch").bind(app, config)
    );

    // Refresh Editor Page
    app.get(
      "/refresh",
      middleware.enableCORS(),
      Security.csp(
        Object.assign(config.csp, {
          frameAncestors: ["*"]
        })
      ),
      require("./refresh").bind(app, config)
    );

    // Entry point to the editor for all users
    app.get(
      "/editor",
      middleware.setErrorMessage("errorMigratingProject"),
      middleware.clearRedirects,
      middleware.setUserIfTokenExists,
      middleware.setPublishUser,
      require("./root").bind(app, config)
    );

    // Load an authenticated user's project
    app.get(
      "/user/:username/:projectId",
      middleware.setErrorMessage("errorLoadingThimble"),
      middleware.clearRedirects,
      middleware.redirectAnonymousUsers,
      middleware.setUserIfTokenExists,
      middleware.setPublishUser,
      middleware.setProject,
      require("./authenticated").bind(app, config)
    );

    // Load an anonymous user's project
    app.get(
      "/anonymous/:anonymousId/:remixId?",
      middleware.setErrorMessage("errorLoadingThimble"),
      middleware.clearRedirects,
      middleware.setUserIfTokenExists,
      middleware.setPublishUser,
      require("./anonymous").bind(app, config)
    );
  }
};
