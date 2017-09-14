var HttpError = require("../../lib/http-error");

module.exports = function(config, passport, req, res, next) {
  var locale = req.session.locale;

  if(!locale) {
    // This can happen when we try to logout again when we are already
    // logged out (i.e. the session doesn't exist and hence req.session.locale
    // is undefined)
    locale = (req.localeInfo && req.localeInfo.lang) ? req.localeInfo.lang : "en-US";
  }

  //var strategy = req.params.strategy.toLowerCase();
  var editorURL = `/${locale}/editor`;

  // TODO: When we implement multiple strategies, we need to incorporate this into an if/else or switch block.
  // Right now we ignore the "strategy" variable, because we already know the only valid response is "webmaker".
  passport.authenticate("webmaker", function(err, user) {
    if (err) {
      res.status(500);
      return next(HttpError.format({
        message: `(Passport) Failed to authenticate user.`,
        context: err
      }, req));
    }

    if (!user) {
      return res.redirect(`/${locale}/login/webmaker`);
    }

    req.logIn(user, function(err) {
      if (err) {
        res.status(500);
        return next(HttpError.format({
          message: `(Passport) Failed to serialize user session cookie.`,
          context: err
        }, req));
      }
      return res.redirect(editorURL);
    });
  })(req, res, next);
};
