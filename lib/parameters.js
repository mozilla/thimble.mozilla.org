module.exports = {
  /**
   * parameter used for fetching thimble projects from the database
   */
  id: function(databaseAPI) {
    return function(req, res, next, id) {
      databaseAPI.find(id, function(err, result) {
        if (err) { return next( err ); }
        if (!result) { return next(404, "project not Found"); }
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
   * parameter used for fetching learning projects using the
   * names templates in the learning_projects directory.
   */
  name: function(req, res, next, name) {
    req.pageToLoad = '/' + name + '.html';
    next();
  }
};
