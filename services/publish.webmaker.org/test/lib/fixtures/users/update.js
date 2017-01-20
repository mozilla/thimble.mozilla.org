var retrieveTestUsers = require('./test-users');

var validUsers;
var invalidUser;

var update = {};

var userToken = {
  authorization: 'token TestUser'
};

module.exports = function(cb) {
  if (update.success) {
    return cb(null, update);
  }

  retrieveTestUsers(function(err, users) {
    if (err) { return cb(err); }

    validUsers = users.valid;
    invalidUser = users.invalid;

    update.fail = {
      userDoesNotExist: {
        headers: userToken,
        url: '/users/999999',
        method: 'put',
        payload: {
          name: 'NewUserName'
        }
      },
      useridTypeError: {
        headers: userToken,
        url: '/users/thisisastring',
        method: 'put',
        payload: {
          name: 'NewUserName'
        }
      }
    };

    cb(null, update);
  });
};
