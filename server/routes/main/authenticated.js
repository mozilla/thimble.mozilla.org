var editor = require("./editor");

module.exports = function(config, req, res, next) {
  // If we aren't migrating a project from an anonymous
  // user to an authenticated user, show Thimble immediately
  if (!req.session.project || !req.session.project.anonymousId) {
    editor.call(this, config, req, res, next);
    return;
  }

  req.project.anonymousId = req.session.project.anonymousId;
  req.project.remixId = req.session.project.remixId; // can be null
  delete req.session.project;

  editor.call(this, config, req, res, next);
};
