var Hapi = require('hapi');
var expect = require('code').expect;

var TOKENS = {
  'ag-dubs': {
    scope: ['user', 'email'],
    id: '1',
    username: 'ag-dubs',
    prefLocale: 'en-US'
  },
  'TestUser': {
    scope: ['user', 'email'],
    id: '2',
    username: 'TestUser',
    prefLocale: 'en-US'
  },
  'UpdatedTestUser': {
    scope: ['user', 'email'],
    id: '2',
    username: 'NewUserName',
    prefLocale: 'en-US'
  }
};

function mockTokenValidator(token, callback) {
  var t = TOKENS[token];
  callback(null, !!t, t);
}

module.exports = function(done) {
  var server = new Hapi.Server();
  server.connection();

  server.register(require('hapi-auth-bearer-token'), function(err) {
    if ( err ) {
      throw err;
    }

    server.auth.strategy('token', 'bearer-access-token', true, {
      validateFunc: mockTokenValidator,
      allowQueryToken: false,
      tokenType: 'token'
    });

    server.register([
      require('../../../api/modules/files/routes.js'),
      require('../../../api/modules/projects/routes.js'),
      require('../../../api/modules/users/routes.js'),
      require('../../../api/modules/publishedProjects/routes.js')
    ], function(err) {
      expect(err).to.not.exist();

      server.start(function(err) {
        expect(err).to.not.exist();

        return done(server);
      });
    });
  });
};
