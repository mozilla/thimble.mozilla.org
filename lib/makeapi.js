module.exports = function(makeEndpoint) {
  var MakeAPI = require('makeapi'),
      make;

  make = MakeAPI({
    makeAPI: makeEndpoint
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
      makeAPI.search(data, function(results) {
        if(results.length) {
          make.update(results[0]._id, data, callback);
        } else {
          make.create(data, callback);
        }
      });
    },

    /**
     * Find makes by search criteria.
     */
    search: function(data, callback) {
      if (data.url) {
        make.find({url: data.url}).email(data.email).then( function( result ) {
          callback( result.hits );
        });
      } else {
        make.email(data.email).then( function( result ) {
          callback( result.hits );
        });
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
