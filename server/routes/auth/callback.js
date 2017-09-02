"use strict";

module.exports = function(config, passport, req, res, next) {
  var locale = req.session.locale;

  if(!locale) {
    // This can happen when we try to logout again when we are already
    // logged out (i.e. the session doesn't exist and hence req.session.locale
    // is undefined)
    locale = (req.localeInfo && req.localeInfo.lang) ? req.localeInfo.lang : "en-US";
  }

  if (req.query.logout) {
    req.session = null;
    return res.redirect(307, "/" + locale);
  }

  //var strategy = req.params.strategy.toLowerCase();
  var editorURL = "/" + locale + "/editor";

  // TODO: When we implement multiple strategies, we need to incorporate this into an if/else or switch block.
  // Right now we ignore the "strategy" variable, because we already know the only valid response is "webmaker".

  // TODO: We actually need to implement a custom callback here, see: http://passportjs.org/docs/configure
  // So that we can handle "failureRedirect" properly, by calling the HTTP-Error class, and triggering an error page.
  passport.authenticate("webmaker", { session: true, successRedirect: editorURL })(req, res, next);
};
