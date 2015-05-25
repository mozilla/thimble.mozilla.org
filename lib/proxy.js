/**
 * Contact a webmaker-fork of atmos/camo for resource proxying of http
 * resources on our https websites (webmaker.org and makes.org).
 */
var env = require('./environment');

module.exports = function() {
  var crypto = require("crypto");
  var key = env.get("PROXY_KEY");
  var proxyHost = env.get("PROXY_HOSTNAME");

  /**
   * camo requires an HMAC-SHA1 digest as part of the URL request
   */
  return function(app, authcheck) {
    authcheck = authcheck || function(_,__,next) { next(); };
    app.get(
      "/getproxyurl",
      authcheck,
      function(req, res) {
        var url = decodeURIComponent(req.query.url);
        var hmac = crypto.createHmac('sha1', key);
        hmac.update(url, 'utf8');
        var hmac_digest = hmac.digest('hex');
        res.json({
          hash: hmac_digest,
          url: proxyHost + "/" + hmac_digest + "?url=" + req.query.url
        });
      }
    );
  };

};
