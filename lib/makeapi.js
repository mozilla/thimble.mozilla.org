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

    create: make.create,
    update: make.update,

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
    remove: make.remove
  };

  // return api object
  return makeAPI;
};
