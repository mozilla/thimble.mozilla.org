module.exports = {
  init: function(app, middleware, config, passport) {

    app.get("/login/:strategy",
      require("./login").bind(app, config, passport));

    app.get("/login/:strategy/callback",
      // TODO: Determine if we actually need this in the new implementation.
      middleware.setErrorMessage("errorAuthenticating"),
      require("./callback").bind(app, config, passport));

    // TODO: Do we want to throw this in middleware.js? Also where do we want to redirect them?
    app.get("/logout", function(req, res) {
      req.logout();
      res.redirect(307, "/");
    })
  }
};
