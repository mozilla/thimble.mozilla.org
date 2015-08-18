var homepage = require("./homepage");

module.exports = function(config, req, res) {
  // If we aren't migrating a project from an anonymous
  // user to an authenticated user, show Thimble immediately
  if(!req.session.project || !req.session.project.anonymousId) {
    homepage.call(this, config, req, res);
    return;
  }

  req.project.anonymousId = req.session.project.anonymousId;
  delete req.session.project;

  homepage.call(this, config, req, res);
};
