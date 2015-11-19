var http = require("http");

var Utils = {
  // top level error handler for our app
  error: function(code, msg) {
    var err = new Error(msg || http.STATUS_CODES[code]);
    err.status = code;
    return err;
  }
};

module.exports = Utils;
