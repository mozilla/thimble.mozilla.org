module.exports = function(config, req, res) {
  res.render("tutorial/template.html", {appURL: config.appURL});
};

exports.styleGuide = function(config) {
  return function(req, res) {
    res.render("tutorial/style-guide.html", {appURL: config.appURL});
  };
};
