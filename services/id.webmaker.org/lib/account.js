var Boom = require('boom');
var hyperquest = require('hyperquest');
var url = require('url');

function getIPAddress(request) {
  // account for load balancer!
  if (request.headers['x-forwarded-for']) {
    return request.headers['x-forwarded-for'];
  }

  return request.info.remoteAddress;
}

function parseMessage(message, callback) {
  var bodyParts = [];
  var bytes = 0;

  message.on('data', function(c) {
    bodyParts.push(c);
    bytes += c.length;
  });

  message.on('end', function() {
    var body = Buffer.concat(bodyParts, bytes).toString('utf8');
    var json;

    if ( message.statusCode !== 200 ) {
      try {
        json = JSON.parse(body);
      } catch (ex) {
        return callback(Boom.create(message.statusCode, 'LoginAPI error', body));
      }
      return callback(Boom.create(message.statusCode, 'LoginAPI error', json));
    }

    try {
      json = JSON.parse(body);
    } catch (ex) {
      return callback(Boom.badImplementation('Error parsing response from Login server', ex));
    }

    callback(null, json);
  });
}

exports.register = function(server, options, next) {
  // https://basic:auth@login.server.org
  var loginAPI = options.loginAPI;

  server.method('account.verifyPassword', function(request, callback) {
    var loginRequest = hyperquest({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ratelimit-ip': getIPAddress(request)
      },
      uri: loginAPI + '/api/v2/user/verify-password'
    });

    loginRequest.on('error', callback);

    loginRequest.on('response', function(message) {
      parseMessage(message, function(err, json) {
        callback(err, json);
      });
    });

    loginRequest.end(JSON.stringify({
      password: request.payload.password,
      uid: request.payload.uid,
      user: {}
    }), 'utf8');
  });

  server.method('account.requestReset', function(request, callback) {
    var appURLObj = url.parse(options.uri + '/reset-password', true);
    appURLObj.query = request.payload.oauth;

    var resetRequest = hyperquest({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ratelimit-ip': getIPAddress(request)
      },
      uri: loginAPI + '/api/v2/user/request-reset-code'
    });

    resetRequest.on('error', callback);

    resetRequest.on('response', function(message) {
      parseMessage(message, function(err, json) {
        callback(err, json);
      });
    });

    resetRequest.end(JSON.stringify({
      uid: request.payload.uid,
      appURL: url.format(appURLObj)
    }), 'utf8');
  });

  server.method('account.resetPassword', function(request, callback) {
    var resetRequest = hyperquest({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ratelimit-ip': getIPAddress(request)
      },
      uri: loginAPI + '/api/v2/user/reset-password'
    });

    resetRequest.on('error', callback);

    resetRequest.on('response', function(message) {
      parseMessage(message, function(err, json) {
        callback(err, json);
      });
    });

    resetRequest.end(JSON.stringify({
      uid: request.payload.uid,
      resetCode: request.payload.resetCode,
      newPassword: request.payload.password
    }), 'utf8');
  });

  server.method('account.createUser', function(request, callback) {
    var createRequest = hyperquest({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ratelimit-ip': getIPAddress(request)
      },
      uri: loginAPI + '/api/v2/user/create'
    });

    createRequest.on('error', callback);

    createRequest.on('response', function(message) {
      parseMessage(message, function(err, json) {
        callback(err, json);
      });
    });

    createRequest.end(JSON.stringify({
      user: {
        email: request.payload.email,
        username: request.payload.username,
        mailingList: request.payload.feedback,
        prefLocale: request.payload.lang
      },
      oauth: {
        client_id: request.payload.client_id
      },
      password: request.payload.password,
      audience: options.uri
    }), 'utf8');
  });

  server.method('account.getUser', function(userId, callback) {
    var ttl = null;
    var getRequest = hyperquest({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      uri: loginAPI + '/user/id/' + userId
    });

    getRequest.on('error', function(err) {
      callback(err, null, 0);
    });

    getRequest.on('response', function(message) {
      parseMessage(message, function(err, json) {
        if (json && !json.user) {
          ttl = 0;
        }

        callback(err, json, ttl);
      });
    });
  }, {
    cache: {
      segment: 'accounts.getUser',
      expiresIn: 1000 * 60,
      staleIn:  1000 * 30,
      staleTimeout: 100,
      generateTimeout: 1000
    }
  });

  server.method('account.requestMigrateEmail', function(request, callback) {
    var appURLObj = url.parse(options.uri + '/migrate', true);
    appURLObj.query = request.payload.oauth;

    var migrateRequest = hyperquest({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ratelimit-ip': getIPAddress(request)
      },
      uri: loginAPI + '/api/v2/user/request'
    });

    migrateRequest.on('error', callback);

    migrateRequest.on('response', function(message) {
      parseMessage(message, function(err, json) {
        callback(err, json);
      });
    });

    migrateRequest.end(JSON.stringify({
      uid: request.payload.uid,
      appURL: url.format(appURLObj),
      migrateUser: true
    }), 'utf8');
  });

  server.method('account.verifyToken', function(request, callback) {
    var verifyRequest = hyperquest({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ratelimit-ip': getIPAddress(request)
      },
      uri: loginAPI + '/api/v2/user/authenticateToken'
    });

    verifyRequest.on('error', callback);

    verifyRequest.on('response', function(message) {
      parseMessage(message, function(err, json) {
        callback(err, json);
      });
    });

    verifyRequest.end(JSON.stringify({
      uid: request.pre.uid,
      token: request.payload.token
    }), 'utf8');
  });

  server.method('account.setPassword', function(request, uid, password, callback) {
    var passwordRequest = hyperquest({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ratelimit-ip': getIPAddress(request)
      },
      uri: loginAPI + '/api/v2/user/enable-passwords'
    });

    passwordRequest.on('error', callback);

    passwordRequest.on('response', function(message) {
      parseMessage(message, function(err, json) {
        callback(err, json);
      });
    });

    passwordRequest.end(JSON.stringify({
      uid: uid,
      password: password
    }), 'utf8');
  });

  server.method('account.checkUsername', function(request, callback) {
    var usernameRequest = hyperquest({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ratelimit-ip': getIPAddress(request)
      },
      uri: loginAPI + '/api/v2/user/exists'
    });

    usernameRequest.on('error', callback);

    usernameRequest.on('response', function(message) {
      parseMessage(message, function(err, json) {
        callback(err, json);
      });
    });

    usernameRequest.end(JSON.stringify({
      uid: request.payload.uid
    }), 'utf8');
  });

  next();
};

exports.register.attributes = {
  name: 'login-webmakerorg'
};
