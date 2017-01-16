var retrieveTestUsers = require('../users').testUsers;

var validUsers;
var invalidUser;

var getAllByUser = {};

var userToken = {
  authorization: 'token ag-dubs'
};

module.exports = function(cb) {
  if (getAllByUser.success) {
    return cb(null, getAllByUser);
  }

  retrieveTestUsers(function(err, users) {
    if (err) { return cb(err); }

    validUsers = users.valid;
    invalidUser = users.invalid;

    getAllByUser.success = {
      default: {
        headers: userToken,
        url: '/users/' + validUsers[0].id + '/projects',
        method: 'get'
      }
    };

    getAllByUser.fail = {
      userDoesNotExist: {
        headers: userToken,
        url: '/users/' + 9999999 + '/projects',
        method: 'get'
      },
      invalidUserId: {
        headers: userToken,
        url: '/users/' + invalidUser.id + '/projects',
        method: 'get'
      }
    };

    cb(null, getAllByUser);
  });
};
