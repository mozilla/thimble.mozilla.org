module.exports = function() {
  var Sequelize = require( "sequelize" ),
      sequelize;

  sequelize = new Sequelize("thimble","",null, {
    dialect: 'sqlite',
    storage: 'thimble.sqlite'
  });

  var ThimbleProject = sequelize.import(__dirname + "/models/thimbleproject");

  var dbOnline = false;
  sequelize.sync().complete(function(err) { dbOnline = !err; });

  /**
   * db function object that we return
   */
  var databaseAPI = {
    /**
     * if there is an originalURL, and that url is already
     * "ours", then this is an update. Otherwise, it's a create.
     */
    write: function(options, callback) {
      if(options.originalURL) {
        options.id = options.originalURL;
        this.update(options, callback);
      }
      else { this.create(options, callback); }
    },

    /**
     * Create a thimble entry in the database.
     */
    create: function(options, callback) {
      var project = ThimbleProject.build({
        userid: options.userid,
        originalURL: options.originalURL,
        rawData: options.rawData,
        sanitizedData: options.sanitizedData,
        finalizedData: options.finalizedData
      });
      project.save()
      .error(function(err) { callback(err); })
      .success(function(result) { callback(null, result); });
    },

    /**
     * Update a thimble entry in the database.
     */
    update: function(options, callback) {
      // we call this if we can find the project-to-update
      var updateProject = function(project) {
        project.updateAttributes({
          rawData: options.rawData,
          sanitizedData: options.sanitizedData,
          finalizedData: options.finalizedData
        })
        .error(function(err) { callback(err); })
        .success(function(update) { callback(null, update); });
      };
      ThimbleProject.find({where: {userid: options.userid, id: options.id}})
      .error(function(err) { callback(err); })
      .success(updateProject);
    },

    /**
     * Find an entry by id
     */
    find: function(id, callback) {
      ThimbleProject.find({where: {id: id}})
      .error(function(err) { callback(err); })
      .success(function(project) { callback(null, project); });
    },

    /**
     * Find all entries by this logged-in-user
     */
    findAllByUser: function(userid, callback) {
      ThimbleProject.findAll({where: {userid: userid}})
      .error(function(err) { callback(err); })
      .success(function(projects) { callback(null, projects); });
    }
  };

  // return api object
  return databaseAPI;
};
