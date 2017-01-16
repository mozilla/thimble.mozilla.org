var Boom = require('boom');
var Hapi = require('hapi');

module.exports = function() {
  var server = new Hapi.Server({ debug: false });
  server.connection({
    host: 'localhost',
    port: 3232
  });

  server.route([
    {
      method: 'POST',
      path: '/api/v2/user/verify-password',
      handler: function(request, reply) {
        var payload = request.payload;
        if ( payload.uid === 'webmaker' && payload.password === 'password' ) {
          return reply({
            user: {
              username: 'webmaker',
              id: '1',
              email: 'webmaker@example.com'
            }
          })
          .type('application/json');
        }

        if ( payload.uid === 'invalidResponse' ) {
          return reply('not json');
        }

        reply(Boom.unauthorized('Invalid username/email or password'));
      }
    },
    {
      method: 'POST',
      path: '/api/v2/user/request-reset-code',
      handler: function(request, reply) {
        var payload = request.payload;
        if ( payload.uid === 'webmaker') {
          return reply({
            status: 'created'
          })
          .type('application/json');
        }

        if ( payload.uid === 'invalidResponse' ) {
          return reply('not json');
        }

        reply(Boom.badImplementation('Login API failure'));
      }
    },
    {
      method: 'POST',
      path: '/api/v2/user/reset-password',
      handler: function(request, reply) {
        var payload = request.payload;
        if ( payload.uid === 'webmaker' ) {
          if ( payload.resetCode !== 'resetCode' ) {
            return reply(Boom.unauthorized('invalid code'));
          }

          return reply({
            status: 'success'
          })
          .type('application/json');
        }

        if ( payload.uid === 'badRequest' ) {
          return reply(Boom.badRequest('bad request'));
        }

        if ( payload.uid === 'invalidResponse' ) {
          return reply('not json');
        }

        reply(Boom.badImplementation('Login API failure'));
      }
    },
    {
      method: 'POST',
      path: '/api/v2/user/create',
      handler: function(request, reply) {
        var payload = request.payload;
        if ( payload.user.username === 'webmaker') {
          return reply({
            user: {
              username: 'webmaker',
              email: 'webmaker@example.com',
              prefLocale: payload.user.prefLocale || 'en-US'
            }
          })
          .type('application/json');
        }

        if ( payload.user.username === 'invalidResponse' ) {
          return reply('not json');
        }

        if ( payload.user.username === 'jsonError' ) {
          return reply({
            error: 'LoginAPI error'
          }).code(200);
        }

        if ( payload.user.username === 'weakpass' ) {
          return reply()
            .code(400);
        }

        reply(Boom.badImplementation('login API failure'));
      }
    },
    {
      method: 'GET',
      path: '/user/id/{id}',
      handler: function(request, reply) {
        var id = request.params.id;
        if ( id === '1') {
          return reply({
            user: {
              username: 'test',
              id: '1',
              email: 'test@example.com'
            }
          })
          .type('application/json');
        }

        if ( id === 'jsonError' ) {
          return reply({
            error: 'Login API error'
          });
        }

        reply(Boom.badImplementation('login API failure'));
      }
    },
    {
      method: 'post',
      path: '/api/v2/user/request',
      handler: function(request, reply) {
        var username = request.payload.uid;
        if ( username === 'test' ) {
          return reply({
            status: 'Login Token Sent'
          });
        }

        reply(Boom.badImplementation('Login Database error'));
      }
    },
    {
      method: 'post',
      path: '/api/v2/user/authenticateToken',
      handler: function(request, reply) {
        var username = request.payload.uid;
        var token = request.payload.token;
        if ( username === 'test' ) {
          if ( token === 'kakav-nufuk' ) {
            return reply(true);
          }
        }

        reply(Boom.unauthorized('invalid username/password combination'));
      }
    },
    {
      method: 'post',
      path: '/api/v2/user/enable-passwords',
      handler: function(request, reply) {
        var username = request.payload.uid;
        var password = request.payload.password;
        if ( username === 'test' ) {
          if ( password === 'Super-Duper-Strong-Passphrase-9001' ) {
            // success
            return reply({
              user: {
                username: 'test'
              }
            });
          }
        }

        reply(Boom.badImplementation('Error setting password'));
      }
    },
    {
      method: 'post',
      path: '/api/v2/user/exists',
      handler: function(request, reply) {
        if ( request.payload.uid === 'test' ) {
          return reply({
            exists: true,
            usePasswordLogin: true
          });
        }

        reply(Boom.notFound('user does not exist'));
      }
    }
  ]);

  return server;
};
