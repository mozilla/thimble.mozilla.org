var home = require("./home");

module.exports = function(config) {
  var homepage = home(config);

  return function(req, res) {
    // If we aren't migrating a project from an anonymous
    // user to an authenticated user, show Thimble immediately
    if(!req.session.project.anonymousId) {
      homepage(req, res);
      return;
    }

    req.project.anonymousId = req.session.project.anonymousId;
    delete req.session.project;

    homepage(req, res);
  };
};
