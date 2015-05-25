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
  "portfoliomaker",
  "s2r",
  "soapbox",
  "stand",
  "stuck",
  "webstructable",
  "wrangler",
  "zombies",
  "zoo-large",
  "zoo-medium",
  "zoo-small",

  // templates
  "tutorial"
];

var env = require('./environment');

module.exports = function() {

  var makeapi = require("./makeapi")(env.get("make"));

  return {
    /**
     * parameter used for fetching thimble projects from the database
     */
    id: function(databaseAPI) {
      return function(req, res, next, id) {
        databaseAPI.find(id, function(err, result) {
          if (err) { return next( err ); }
          if (!result) { return next({status: 404, message: req.gettext("Project not Found")}); }
          req.requestId = id;
          req.pageData = result.rawData;
          req.makeUrl = result.url;
          makeapi.search({ url: result.url }, function(err, results) {
            if(err) {
              // not having the makeapi available should not hold up serving the project here.
            }
            if(results) {
              req.make = results[0];
            }
            next();
          });
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
          if (!result) { return next({status: 404, message: req.gettext("Project not Found")}); }
          req.oldid = oldid;
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
        res.locals.pageToLoad = '/templated_projects/' + name + '.html';
      }
      next();
    }
  };
};
