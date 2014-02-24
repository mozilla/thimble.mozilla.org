var http = require("http");

module.exports = {
  slugify: require("uslug"),

  error: function( code, msg ) {
    var err = new Error( msg || http.STATUS_CODES[ code ]);
    err.status = code;
    return err;
  }
};
