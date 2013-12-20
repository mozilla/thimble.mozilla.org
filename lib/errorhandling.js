function renderError( err, res ) {
  res.format({
    "text/html": function() {
      res.render( 'error.html', err );
    },
    "application/json": function() {
      res.json( { status: err.status, message: err.message } );
    },
    "default": function() {
      res.send( err.message );
    }
  });
}

module.exports.errorHandler = function(err, req, res, next) {
  if (!err.status) {
    err.status = 500;
  }

  res.status(err.status);
  renderError(err, res);
};

module.exports.pageNotFoundHandler = function(req, res, next) {
  var err = {
    message: req.gettext("You found a loose thread!"),
    status: 404
  };

  res.status(err.status);
  renderError(err, res);
};
