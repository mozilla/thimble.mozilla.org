module.exports = function(config, req, res) {
  res.removeHeader("X-Frame-Options");
  res.render("refresh.html", {
    appURL: config.appURL
  });
};
