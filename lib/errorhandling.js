module.exports.errorHandler = function(err, req, res, next) {
  if (!err.status) {
    err.status = 500;
  }

  res.status(err.status);
  res.render("error.html", err);
};

module.exports.pageNotFoundHandler = function(err, req, res, next) {
  var err = {
    message: req.gettext("You found a loose thread!"),
    status: 404
  };

  res.status(err.status);
  res.render("error.html", err);
};
