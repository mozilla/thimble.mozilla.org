module.exports = function(makeEnv) {
  var MakeAPI = require('makeapi'),
      MAKE_LIMIT = makeEnv.limit || 100000,
      make;

  make = MakeAPI.makeAPI({
    apiURL: makeEnv.endpoint,
    auth: makeEnv.auth
  });

  /**
   * db function object that we return
   */
  var makeAPI = {

    /**
     * Create a make if no duplicates exist under this user,
     * otherwise update the duplicate.
     */
    publish: function(data, callback) {
      // We are trying to publish a unique make.
      // First we check if the make already exists, if so, update it.
      // Otherwise, we should create one.
      makeAPI.search(data.make, function(err, results) {
        if (err) {
          callback(err, results);
        } else if (results.length === 1) {
          // We found a result.
          // An array is returned even though we searched on a unique url.
          // We can assume the first result is our unique entry.
          make.update(results[0]._id, data, callback);
        } else {
          // Nothing unique found.
          // create a new entry.
          make.create(data, callback);
        }
      });
    },

    /**
     * Find makes by search criteria.
     */
    search: function(data, callback) {
      if (data.url && data.email) {
        make.find({url: data.url}).user(data.email).then(callback);
      } else if (data.url) {
        make.find({url: data.url}).then(callback);
      } else {
        make.user(data.email).limit(MAKE_LIMIT).then(callback);
      }
    },

    /**
     * Remove a make by id.
     */
    remove: function(id, callback) {
      make.remove(id, callback);
    }
  };

  // return api object
  return makeAPI;
};
