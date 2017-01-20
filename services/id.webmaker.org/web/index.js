require('habitat').load();
require('newrelic');

var Hoek = require('hoek');

var options = {
  host: process.env.HOST,
  port: process.env.PORT,
  loginAPI: process.env.LOGINAPI,
  oauth_clients: process.env.OAUTH_DB ? JSON.parse(process.env.OAUTH_DB) : [],
  authCodes: process.env.AUTH_CODES ? JSON.parse(process.env.AUTH_CODES) : {},
  accessTokens: process.env.ACCESS_TOKENS ? JSON.parse(process.env.ACCESS_TOKENS) : [],
  cookieSecret: process.env.COOKIE_SECRET,
  secureCookies: process.env.SECURE_COOKIES === 'true',
  uri: process.env.URI,
  enableCSRF: process.env.ENABLE_CSRF !== 'false',
  logging: process.env.LOGGING === 'true',
  logLevel: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info',
  redisUrl: process.env.REDIS_URL
};

var server = require('./server')(options);

server.start(function(error) {
  Hoek.assert(!error, error);

  console.log('Server running at: %s', server.info.uri);
});
