module.exports = function(makeEnv) {
  var MakeAPI = require('makeapi'),
      make;

  make = MakeAPI({
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
    publish: function(data, user, callback) {
      var body = {
        maker: user,
        make: data
      };

      makeAPI.search(data, function(err, results) {
        if (err) {
          callback(err, results);
        } else if (results.hits.length) {
          make.update(results.hits[0]._id, body, callback);
        } else {
          make.create(body, callback);
        }
      });
    },

    /**
     * Find makes by search criteria.
     */
    search: function(data, callback) {

      if (data.url) {
        make.find({url: data.url}).email(data.email).then(callback);
      } else {
        make.email(data.email).limit(100).then(callback);
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
