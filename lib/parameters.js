var whitelisted_projects = [
  // learning projects
  "BTWF_animated_gif",
  "BTWF_campaign",
  "BTWF_local_meetup",
  "avataromatic",
  "bakery",
  "bully",
  "bunnies",
  "idl",
  "map",
  "meme",
  "nypl",
  "o2_helloworld",
  "o2_thepitch",
  "opencinema",
  "opendisco",
  "opengallery",
  "openmasterpiece",
  "openwebville",
  "portfoliomaker",
  "s2r",
  "soapbox",
  "stand",
  "stuck",
  "tests",
  "webstructable",
  "wrangler",
  "zombies",
  "zoo-large",
  "zoo-medium",
  "zoo-small",
  "zoo",

  // templates
  "tutorial"
];

module.exports = {
  /**
   * parameter used for fetching thimble projects from the database
   */
  id: function(databaseAPI) {
    return function(req, res, next, id) {
      databaseAPI.find(id, function(err, result) {
        if (err) { return next( err ); }
        if (!result) { return next(404, "project not Found"); }
        req.requestId = id;
        req.pageData = result.sanitizedData;
        req.tutorialUrl = result.url;
        next();
      });
    };
  },
  /**
   * parameter used for fetching legacy thimble projects from the
   * special legacy database.
   * NOTE: this parameter is technically obsolote and will be
   *       removed at some point in the near future.
   */
  oldid: function(legacyDatabaseAPI) {
    return function(req, res, next, oldid) {
      legacyDatabaseAPI.findOld(oldid, function(err, result) {
        if (err) { return next( err ); }
        if (!result) { return next(404, "Project not Found"); }
        req.pageData = result.html;
        next();
      });
    };
  },
  /**
   * parameter used for fetching learning projects or templates
   * in the learning_projects or templates directories.
   */
  name: function(req, res, next, name) {
    // Only use whitelisted learning projects
    if (whitelisted_projects.indexOf(name) != -1) {
      res.locals.pageToLoad = '/' + name + '.html';
    }
    next();
  }
};
