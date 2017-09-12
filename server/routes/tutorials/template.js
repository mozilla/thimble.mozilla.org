module.exports = function(config, req, res) {
  res.render("tutorial/template.html", { appURL: config.appURL });
};
