var retrieveTestUsers = require('./test-users');

var validUsers;
var invalidUser;

var getOne = {};

var userToken = {
  authorization: 'token ag-dubs'
};

module.exports = function(cb) {
  if (getOne.success) {
    return cb(null, getOne);
  }

  retrieveTestUsers(function(err, users) {
    if (err) { return cb(err); }

    validUsers = users.valid;
    invalidUser = users.invalid;

    getOne.success = {
      default: {
        headers: userToken,
        url: '/users/' + validUsers[0].id,
        method: 'get'
      }
    };

    getOne.fail = {
      invalidUserid: {
        headers: userToken,
        url: '/users/' + invalidUser.id,
        method: 'get'
      },
      userDoesNotExist: {
        headers: userToken,
        url: '/users/' + 9999999,
        method: 'get'
      }
    };

    cb(null, getOne);
  });
};
