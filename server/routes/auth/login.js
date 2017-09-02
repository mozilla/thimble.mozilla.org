module.exports = function(config, passport, req, res, next) {
  if (req.query.anonymousId) {
    req.session.project = {
      anonymousId: req.query.anonymousId,
      migrate: true
    };
  } else {
    req.session.home = true;
  }

  req.session.locale = (req.localeInfo && req.localeInfo.lang) ? req.localeInfo.lang : "en-US";

  //var strategy = req.params.strategy.toLowerCase();
  var action = req.query.signup ? "signup" : "signin";

  // TODO: When we implement multiple strategies, we need to incorporate this into an if/else or switch block.
  // Right now we ignore the "strategy" variable, because we already know the only valid response is "webmaker".
  passport.authenticate("webmaker", { scopes: ["user", "email"], action: action })(req, res, next);
};
