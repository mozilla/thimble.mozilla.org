"use strict";

// TODO: Here we're going to take the exposed anonymous function and give it the passport object
// We will use that object to initiate any new strategies, such as passport-webmaker.
// All strategy dependencies can be declared in this file, but passport needs to be declared in index.js.

let WebmakerStrategy = require("passport-webmaker").Strategy;
let url = require("url");

let env = require("./lib/environment");
let oauth = env.get("OAUTH");

module.exports = function passport(passport) {

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
};
