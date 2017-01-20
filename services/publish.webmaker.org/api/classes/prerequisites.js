"use strict";

const Boom = require(`boom`);
const Promise = require(`bluebird`);

const Users = require(`../modules/users/model`);
const Errors = require(`./errors`);

class Prerequisites {
  /**
  * confirmRecordExists(model[, mode, requestKey, databasekey])
  *
  * Returns a HAPI pre-req package configured to
  * to fetch all matching records of the passed `model`,
  * using data from the route parameters or the request payload
  * to build the query.
  *
  * @param {Object} model - Bookshelf model for querying
  * @param {Object} config - Contains configuration options for the query:
  *     mode {String} - 'param' or 'payload' (if omitted, returns all records)
  *     requestKey {String} - key of the param/payload
  *     databaseKey {String} - key of the database model
  *
  * @return {Promise} - Promise fullfilled when the record is found
  */
  static confirmRecordExists(model, config) {
    config = config || {};
    const dbKey = config.databaseKey || config.requestKey;
    const requestKey = config.requestKey;

    return {
      assign: `records`,
      method(req, reply) {
        const queryOptions = {};

        if (requestKey) {
          queryOptions.where = {};

          if (config.mode === `param`) {
            queryOptions.where[dbKey] = req.params[requestKey];
          } else {
            queryOptions.where[dbKey] = req.payload[requestKey];
          }
        }

        let fetchOptions = {};

        if (config.columns) {
          fetchOptions = { columns: config.columns };
        }

        const result = model
        .query(queryOptions)
        .fetchAll(fetchOptions)
        .then(function(records) {
          if (records.length === 0) {
            throw Boom.notFound(null, {
              debug: true,
              error: `resource not found`
            });
          }

          return records;
        })
        .catch(Errors.generateErrorResponse);

        return reply(result);
      }
    };
  }

  /**
  * validateUser()
  *
  * Ensures that the user sending the request exists in the
  * current context. This means that the user should have hit the
  * /users/login route first
  *
  * @return {Promise} - Promise fullfilled when the user has been found
  */
  static validateUser() {
    return {
      assign: `user`,
      method(request, reply) {
        const result = Users.query({
          where: {
            name: request.auth.credentials.username
          }
        })
        .fetch()
        .then(function(authenticatedUser) {
          if (!authenticatedUser) {
            // This case means our auth logic failed unexpectedly
            throw Boom.badImplementation(null, {
              error: `authenticated user doesn't exist (mayday!)`
            });
          }

          return authenticatedUser;
        })
        .catch(Errors.generateErrorResponse);

        return reply(result);
      }
    };
  }

  /**
  * validateOwnership()
  *
  * Ensures the authenticated user is the owner of the
  * resource being manipulated or requested.
  *
  * @return {Promise} - Promise fullfilled when the user has been confirmed to
  * be the owner of the resource requested
  */
  static validateOwnership() {
    return {
      method(request, reply) {
        const resource = request.pre.records.models[0];
        const authenticatedUser = request.pre.user;

        const result = Promise.resolve()
        .then(function() {
          // Check if the resource is the owning user, otherwise fetch
          // the user it's owned by
          if (resource.tableName === `users`) {
            return resource;
          }

          return resource
          .user()
          .query({})
          .fetch()
          .then(function(owner) {
            if (!owner) {
              // This should never ever happen
              throw Boom.badImplementation(null, {
                error: `An owning user can't be found (mayday!)`
              });
            }

            return owner;
          });
        })
        .then(function(owner) {
          if (owner.get(`id`) !== authenticatedUser.get(`id`)) {
            throw Boom.unauthorized(null, {
              debug: true,
              error: `User doesn't own the resource requested`
            });
          }
        })
        .catch(Errors.generateErrorResponse);

        return reply(result);
      }
    };
  }

  /**
  * validateCreationPermission([foreignKey, model])
  *
  * Ensures the authenticated user is the owner of the
  * resource being created.
  *
  * @param {Object} foreignKey - Foreign key of an existing resource
  * @param {Object} model - Bookshelf model for querying
  *
  * @return {Promise} - Promise fullfilled when the user has been confirmed to
  * be the owner of the resource being created
  */
  static validateCreationPermission(foreignKey, model) {
    return {
      method(request, reply) {
        const result = Users.query({
          where: {
            name: request.auth.credentials.username
          }
        })
        .fetch()
        .then(function(userRecord) {
          if (!userRecord) {
            // This case means our auth logic failed unexpectedly
            throw Boom.badImplementation(null, {
              error: `User doesn't exist!`
            });
          }

          // Check to see if there's a direct reference to `user_id` in the payload
          if (!foreignKey) {
            if (userRecord.get(`id`) !== request.payload.user_id) {
              throw Boom.unauthorized(null, {
                debug: true,
                error: `User doesn't own the resource being referenced`
              });
            }

            return;
          }

          const query = { where: {} };

          query.where.id = request.payload[foreignKey];

          return model.query(query)
          .fetch()
          .then(function(record) {
            if (!record) {
              throw Boom.notFound(null, {
                debug: true,
                error: `Foreign key doesn't reference an existing record`
              });
            }

            if (userRecord.get(`id`) !== record.get(`user_id`)) {
              throw Boom.unauthorized(null, {
                debug: true,
                error: `User doesn't own the resource being referenced`
              });
            }
          });
        })
        .catch(Errors.generateErrorResponse);

        reply(result);
      }
    };
  }

  /**
  * trackTemporaryFile()
  *
  * Stores the path to a temporary file in req.app for clearing after a request completes
  * and in req.pre for use in the handler
  *
  * @return {String} - Path to the temporary file
  */
  static trackTemporaryFile() {
    return {
      assign: `tmpFile`,

      /* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^reply$" }]*/
      method(request, reply) {
        const buffer = request.payload.buffer;

        // Store the paths for after the request completes
        request.app.tmpFile = buffer.path;

        reply(buffer.path);
      }
    };
  }
}

module.exports = Prerequisites;
