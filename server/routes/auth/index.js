module.exports = {
  init: function(app, middleware, config, passport) {

    app.get("/login/:strategy",
      require("./login").bind(app, config, passport));

    app.get("/login/:strategy/callback",
      middleware.setErrorMessage("errorAuthenticating"),
      require("./callback").bind(app, config, passport));

    app.get("/logout", middleware.logout);
  }
};
