let WebmakerStrategy = require("passport-webmaker").Strategy;
let url = require("url");
let Cryptr = require("cryptr");

let env = require("./lib/environment");
let oauth = env.get("OAUTH");

module.exports = function (passport) {
  let cryptr = new Cryptr(env.get("SESSION_SECRET"));

  passport.use(new WebmakerStrategy({
    clientID: oauth.webmaker_client_id,
    clientSecret: oauth.webmaker_client_secret,
    authorizationURL: url.resolve(oauth.webmaker_auth_url, "/login/oauth/authorize"),
    tokenURL: url.resolve(oauth.webmaker_auth_url, "/login/oauth/access_token"),
    profileURL: url.resolve(oauth.webmaker_auth_url, "/user"),
    state: true,
    passReqToCallback: true
  }, function (req, accessToken, refreshToken, profile, done) {
    req.session.token = cryptr.encrypt(accessToken);
    return done(null, profile);
  }));

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
};
