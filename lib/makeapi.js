module.exports = function(makeEnv) {

  if ( !( makeEnv.endpoint && makeEnv.privatekey && makeEnv.publickey ) ) {
    throw new Error( "MakeAPI config invalid or missing" );
  }

  var makeAPI = require('makeapi-client'),
      MAKE_LIMIT = makeEnv.limit || 1000,
      make;

  make = makeAPI({
    apiURL: makeEnv.endpoint,
    hawk: {
      key: makeEnv.privatekey,
      id: makeEnv.publickey,
      algorithm: "sha256"
    }
  });

  /**
   * db function object that we return
   */
  var makeAPI = {

    create: function() {
      make.create.apply(make, arguments);
    },

    update: function() {
      make.update.apply(make, arguments);
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
    remove: function() {
      make.remove.apply(make, arguments);
    }
  };

  // return api object
  return makeAPI;
};
