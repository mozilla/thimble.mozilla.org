"use strict";

var request = require("request");
var HttpError = require("../../lib/http-error");

module.exports = function(config, req, res, next) {
  var oauth = config.oauth;
  var cryptr = config.cryptr;
  var authURL = `${oauth.authorization_url}/login/oauth/access_token`;
  var locale = req.session.locale;
  if (!locale) {
    // This can happen when we try to logout again when we are already
    // logged out (i.e. the session doesn't exist and hence req.session.locale
    // is undefined)
    locale =
      req.localeInfo && req.localeInfo.lang ? req.localeInfo.lang : "en-US";
  }

  res.set("Cache-Control", "no-cache");

  if (req.query.logout) {
    req.session = null;
    return res.redirect(307, "/" + locale);
  }

  if (!req.query.code) {
    res.status(401);
    return next(
      HttpError.format(
        {
          message: "OAuth code was not set by the authentication server",
          context: req.query
        },
        req
      )
    );
  }

  if (!req.cookies.state || !req.query.state) {
    res.status(401);
    return next(
      HttpError.format(
        {
          message:
            "No state information was passed back by the authentication server",
          context: req.query
        },
        req
      )
    );
  }

  if (req.cookies.state !== req.query.state) {
    res.status(401);
    return next(
      HttpError.format(
        {
          message:
            "The initial state during login does not match the state returned by the authentication server.",
          context: req.query
        },
        req
      )
    );
  }

  if (req.query.client_id !== oauth.client_id) {
    res.status(401);
    return next(
      HttpError.format(
        {
          message:
            "The client id returned by the authentication server does not match Thimble's client id.",
          context: req.query
        },
        req
      )
    );
  }

  // First, fetch the token
  request.post(
    {
      url: authURL,
      form: {
        client_id: oauth.client_id,
        client_secret: oauth.client_secret,
        grant_type: "authorization_code",
        code: req.query.code
      }
    },
    function(err, response, body) {
      if (err) {
        res.status(500);
        return next(
          HttpError.format(
            {
              message: `Failed to send request to ${authURL}. Verify that the authentication server is up and running.`,
              context: err
            },
            req
          )
        );
      }

      if (response.statusCode !== 200) {
        res.status(response.statusCode);
        return next(
          HttpError.format(
            {
              message: `Request to ${authURL} returned a status of ${response.statusCode}`,
              context: response.body
            },
            req
          )
        );
      }

      try {
        body = JSON.parse(body);
      } catch (e) {
        res.status(500);
        return next(
          HttpError.format(
            {
              message:
                "Data (access token) sent by the authentication server was in an invalid format. Failed to run `JSON.parse`",
              context: e.message,
              stack: e.stack
            },
            req
          )
        );
      }

      req.session.token = cryptr.encrypt(body.access_token);

      var userURL = `${oauth.authorization_url}/user`;

      // Next, fetch user data
      request.get(
        {
          url: userURL,
          headers: {
            Authorization: "token " + body.access_token
          }
        },
        function(err, response, body) {
          if (err) {
            res.status(500);
            return next(
              HttpError.format(
                {
                  message: `Failed to send request to ${userURL}. Verify that the authentication server is up and running.`,
                  context: err
                },
                req
              )
            );
          }

          if (response.statusCode !== 200) {
            res.status(response.statusCode);
            return next(
              HttpError.format(
                {
                  message: `Request to ${userURL} returned a status of ${response.statusCode}`,
                  context: response.body
                },
                req
              )
            );
          }

          try {
            req.session.user = JSON.parse(body);
          } catch (e) {
            res.status(500);
            return next(
              HttpError.format(
                {
                  message:
                    "User data sent by the authentication server was in an invalid format. Failed to run `JSON.parse`",
                  context: e.message,
                  stack: e.stack
                },
                req
              )
            );
          }

          res.redirect(307, "/" + locale + "/editor");
        }
      );
    }
  );
};
