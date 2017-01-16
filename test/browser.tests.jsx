process.env.NODE_ENV = 'TEST';

// This is essentially bulk require
var req = require.context('../templates', true, /test\.js.*$/);
req.keys().forEach(function (file) {
  req(file);
});
