var config = require("./config");
var middleware = require("../lib/middleware")(config);

// Content-fetching function used for generating the output
// on http://[...]/data routes via the index.rawData function.
function getPageData(req) {
  var content = "";
  if (req.pageData) {
    content = req.pageData;
    if (req.query.mode && req.query.mode === "remix") {
      content = content.replace(/<title([^>]*)>/, "<title$1>Remix of ");
    }
  }
  return content;
}

module.exports = function() {
  return {
    init: function(app, passport) {
      [
        require("./main"),
        require("./projects"),
        require("./files"),
        require("./tutorials")
      ].forEach(function(module) {
        module.init(app, middleware, config);
      });
      // TODO: See if this is the best way to do this.
      require("./auth").init(app, middleware, config, passport);
    },

    rawData: function(req, res) {
      res.type('text/plain; charset=utf-8');
      res.send(getPageData(req));
    }
  };
};
