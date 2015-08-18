var home = require("./home");

module.exports = function(config) {
  var homepage = home(config);

  return function(req, res) {
    homepage(req, res);
  };
};
