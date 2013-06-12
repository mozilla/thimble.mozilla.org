module.exports = function databaseHandleConstructor(modelName, options) {
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

  var model = sequelize.import(__dirname + "/models/" + modelName);
  sequelize.sync();
  model.sync();

  /**
   * db function object that we return
   */
  var databaseAPI = {
    /**
     * if there is an originalURL, and that url is already
     * "ours", AND this is an edit operation, then this is
     * an update. Otherwise, it's a create.
     */
    write: function(options, callback) {
      if(options.origin && options.edit) {
        options.id = options.origin;
        this.update(options, callback);
      }
      else { this.create(options, callback); }
    },

    /**
     * Create a thimble entry in the database.
     */
    create: function(options, callback) {
      var project = model.build({
        userid: options.userid,
        remixedFrom: options.remixedFrom,
        rawData: options.rawData,
        sanitizedData: options.sanitizedData,
        finalizedData: options.finalizedData,
        title: options.title
      });
      project.save()
      .error(callback)
      .success(function(result) { callback(null, result); });
    },

    /**
     * Update a thimble entry in the database.
     */
    update: function(options, callback) {
      model.find({where: {userid: options.userid, id: options.id}})
      .error(callback)
      .success(function(project) {
        project.updateAttributes({
          rawData: options.rawData,
          sanitizedData: options.sanitizedData,
          finalizedData: options.finalizedData,
          title: options.title
        })
        .error(function(err) { callback(err); })
        .success(function(update) { callback(null, update); });
      });
    },

    /**
     * Update a thimble entry with a URL
     */
    updateUrl: function(options, callback) {
      model.find({where: {userid: options.userid, id: options.id}})
      .error(callback)
      .success(function(project) {
        project.updateAttributes({
          url: options.url
        })
        .error(function(err) { callback(err); })
        .success(function(update) { callback(null, update); });
      });
    },

    /**
     * Find an entry by id
     */
    find: function(id, callback) {
      model.find({where: {id: id}})
      .error(callback)
      .success(function(project) { callback(null, project); });
    },

    /**
     * Find an old entry by (short string) id
     */
    findOld: function(short_url_id, callback) {
      model.find({where: {short_url_id: short_url_id}})
      .error(callback)
      .success(function(project) { callback(null, project); });
    },

    /**
     * Find all entries by this logged-in-user
     */
    findAllByUser: function(userid, callback) {
      model.findAll({where: {userid: userid}})
      .error(callback)
      .success(function(projects) { callback(null, projects); });
    },

    /**
     * Count number of entries in where clause
     */
    count: function(where, callback) {
      model.count({
        where: where
      }).done(function(err, count) {
        callback(err, count);
      });
    }
  };

  // return api object
  return databaseAPI;
};
