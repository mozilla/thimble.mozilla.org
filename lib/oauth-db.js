var Boom = require('boom');
var crypto = require('crypto');
var Hoek = require('hoek');
var pg = require('pg');
var queries = require('./queries');
var connString = process.env.POSTGRE_CONNECTION_STRING;
var salt = process.env.TOKEN_SALT;

var OAuthDB = function OAuthDB() {
  Hoek.assert(connString, 'You must provide a connection string to a PostgreSQL database');
  Hoek.assert(salt, 'You must define a TOKEN_SALT for salting auth codes and access tokens');
};

function executeQuery(query, params, callback) {
  pg.connect(connString, function(err, client, release) {
    if ( err ) {
      release();
      return callback(err);
    }

    client.query({
      text: query,
      values: params
    }, function(err, result) {
      release();
      if ( err ) {
        return callback(err);
      }

      callback(null, result.rows[0]);
    });
  });
}

OAuthDB.prototype.getClient = function(clientId, callback) {
  executeQuery(queries.get.client, [clientId], function(err, client) {
    if ( err ) {
      return callback(err);
    }

    if (!client) {
      return callback(Boom.badRequest('invalid client_id'));
    }

    callback(null, client);
  });
};

OAuthDB.prototype.generateAuthCode = function(clientId, userId, scopes, expiresAt, callback) {
  crypto.randomBytes(32, function(err, random) {
    Hoek.assert(!err, err);

    var authCode = random.toString('hex');

    var saltedCode = crypto.createHmac('sha256', salt)
      .update(authCode)
      .digest('hex');

    executeQuery(queries.create.authCode, [
      saltedCode,
      clientId,
      userId,
      JSON.stringify(scopes),
      expiresAt
    ], function(err) {
      if ( err ) {
        return callback(err);
      }

      callback(null, authCode);
    });
  }.bind(this));
};

OAuthDB.prototype.verifyAuthCode = function(authCode, clientId, callback) {
  var saltedCode = crypto.createHmac('sha256', salt)
    .update(authCode)
    .digest('hex');

  executeQuery(queries.get.authCode, [saltedCode],  function(err, code) {
    if ( err ) {
      return callback(err);
    }

    if ( !code ) {
      return callback(Boom.forbidden('invalid auth code'));
    }

    if ( code.client_id !== clientId ) {
      return callback(Boom.forbidden('invalid client id'));
    }

    if ( code.expires_at <= Date.now() ) {
      return callback(Boom.forbidden('auth code expired'));
    }

    executeQuery(queries.remove.authCode, [saltedCode], function(err) {
      if ( err ) {
        return callback(err);
      }

      callback(null, code);
    });
  });
};

OAuthDB.prototype.generateAccessToken = function(clientId, userId, scopes, callback) {
  crypto.randomBytes(32, function(err, random) {
    Hoek.assert(!err, err);

    var accessToken = random.toString('hex');

    var saltedToken = crypto.createHmac('sha256', salt)
      .update(accessToken)
      .digest('hex');

    executeQuery(queries.create.accessToken, [
      saltedToken,
      clientId,
      userId,
      JSON.stringify(scopes)
    ], function(err) {
      if ( err ) {
        return callback(err);
      }

      callback(null, accessToken);
    });
  }.bind(this));
};

OAuthDB.prototype.lookupAccessToken = function(accessToken, callback) {
  var saltedToken = crypto.createHmac('sha256', salt)
    .update(accessToken)
    .digest('hex');

  executeQuery(queries.get.accessToken, [saltedToken], function(err, token) {
    if ( err ) {
      return callback(err);
    }

    if ( !token ) {
      return callback(Boom.unauthorized('Invalid Access Token'));
    }

    callback(null, token);
  });
};

module.exports = OAuthDB;
