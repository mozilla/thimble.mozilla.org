var request = require("request");

module.exports = function(config, req, res, next) {
  var oauth = config.oauth;
  var cryptr = config.cryptr;

  if (req.query.logout) {
    req.session = null;
    return res.redirect(301, '/');
  }

  if (!req.query.code) {
    return next({ status: 401, message: "OAUTH: Code required" });
  }

  if (!req.cookies.state || !req.query.state) {
    return next({ status: 401, message: "OAUTH: State required" });
  }

  if (req.cookies.state !== req.query.state) {
    return next({ status: 401, message: "OAUTH: Invalid state" });
  }

  if (req.query.client_id !== oauth.client_id) {
    return next({ status: 401, message: "OAUTH: Invalid client credentials" });
  }

  // First, fetch the token
  request.post({
    url: oauth.authorization_url + '/login/oauth/access_token',
    form: {
      client_id: oauth.client_id,
      client_secret: oauth.client_secret,
      grant_type: "authorization_code",
      code: req.query.code
    }
  }, function(err, response, body) {
    if (err) {
      console.log("Request error: ", err, " Body: ", body);
      return next({ status: 500, message: "Internal server error. See logs for details" });
    }

    if (response.statusCode !== 200) {
      console.log("Code " + response.statusCode + ". Error getting access token: ", body);
      return next({ status: response.statusCode, message: body });
    }

    try {
      body = JSON.parse(body);
    } catch(e) {
      return next({status: 500, err: e});
    }

    req.session.token = cryptr.encrypt(body.access_token);

    // Next, fetch user data
    request.get({
      url: oauth.authorization_url + "/user",
      headers: {
        "Authorization": "token " + body.access_token
      }
    }, function(err, response, body) {
      if (err) {
        console.log("Request error: ", err, " Body: ", body);
        return next({ status: 500, message: "Internal server error. See logs for details" });
      }

      if (response.statusCode !== 200) {
        console.log("Code " + response.statusCode + ". Error getting user data: ", body);
        return next({ status: response.statusCode, message: body });
      }

      try {
        req.session.user = JSON.parse(body);
      } catch(e) {
        return next({status: 500, err: e});
      }

      // Was this sign-in triggered from the home page?
      if (req.session.home) {
        delete req.session.home;
        return res.redirect(301, '/');
      }

      res.redirect(301, '/editor');
    });
  });
};
