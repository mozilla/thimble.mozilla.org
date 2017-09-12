module.exports = {
  init: function(app, middleware, config) {
    // Tutorial templates
    app.get("/tutorial/tutorial.html", require("./template").bind(app, config));

    app.get(
      "/tutorial/tutorial-style-guide.html",
      require("./style-guide").bind(app, config)
    );
  }
};
