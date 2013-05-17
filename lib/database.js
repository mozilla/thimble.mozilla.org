module.exports = function(options) {
  var Sequelize = require( "sequelize" ),
      sequelize;

  // For MySQL URLs like CLEARDB_DATABASE_URL on Heroku
  if (typeof options == "string") {
    var url = require("url").parse(options);
    options = {
      dialect: url.protocol.slice(0, -1),
      user: url.auth.split(":")[0],
      password: url.auth.split(":")[1],
      host: url.host,
      name: url.pathname.slice(1)
    };
  }

  sequelize = new Sequelize(options.name, options.user, options.password, {
    dialect: options.dialect,
    host: options.host,
    logging: false,
    storage: options.storage
  });

  var ThimbleProject = sequelize.import(__dirname + "/models/thimbleproject");
  sequelize.sync();

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
        finalizedData: options.finalizedData,
        title: options.title
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
          finalizedData: options.finalizedData,
          title: options.title
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
    },

    /**
     * Count number of entries in where clause
     */
    count: function(where, callback) {
      ThimbleProject.count({
        where: where
      }).done(function(err, count) {
        callback(err, count);
      });
    }
  };

  // return api object
  return databaseAPI;
};
