module.exports = function(config, req, res) {
  res.render("tutorial/style-guide.html", { appURL: config.appURL });
};
