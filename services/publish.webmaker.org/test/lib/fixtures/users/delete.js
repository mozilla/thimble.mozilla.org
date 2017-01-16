var retrieveTestUsers = require('./test-users');

var validUsers;
var invalidUser;

var del = {};

var userToken = {
  authorization: 'token TestUser'
};

module.exports = function(cb) {
  if (del.success) {
    return cb(null, del);
  }

  retrieveTestUsers(function(err, users) {
    if (err) { return cb(err); }

    validUsers = users.valid;
    invalidUser = users.invalid;

    del.fail = {
      userDoesNotExist: {
        headers: userToken,
        url: '/users/999999',
        method: 'delete'
      },
      useridTypeError: {
        headers: userToken,
        url: '/users/thisisastring',
        method: 'delete'
      }
    };

    cb(null, del);
  });
};
