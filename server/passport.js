"use strict";

let WebmakerStrategy = require("passport-webmaker").Strategy;
let url = require("url");

let env = require("./lib/environment");
let oauth = env.get("OAUTH");

module.exports = function (passport) {

  passport.use(new WebmakerStrategy({
    clientID: oauth.webmaker_client_id,
    clientSecret: oauth.webmaker_client_secret,
    authorizationURL: url.resolve(oauth.webmaker_auth_url, "/login/oauth/authorize"),
    tokenURL: url.resolve(oauth.webmaker_auth_url, "/login/oauth/access_token"),
    profileURL: url.resolve(oauth.webmaker_auth_url, "/user"),
    state: true
  }, function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }));

  // TODO: Review this stuff, see if we need it or if it's default handling.
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  // TODO: Same thing as above, but with this as well.
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
};
