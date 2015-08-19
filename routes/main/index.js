module.exports = {
  init: function(app, middleware, config) {
    // Entry point for all users
    app.get("/",
      middleware.setUserIfTokenExists,
      middleware.setPublishUser,
      require("./root").bind(app, config));

    // Main route for authenticated users
    app.get("/user/:username/:projectId",
      middleware.redirectAnonymousUsers,
      middleware.setUserIfTokenExists,
      middleware.setPublishUser,
      middleware.setProject,
      require("./authenticated").bind(app, config));

    // Main route for anonymous users
    app.get("/anonymous/:anonymousId/:remixId?",
      middleware.setUserIfTokenExists,
      middleware.setPublishUser,
      require("./anonymous").bind(app, config));
  }
};
