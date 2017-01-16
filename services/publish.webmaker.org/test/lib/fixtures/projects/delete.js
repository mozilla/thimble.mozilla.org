var retrieveTestUsers = require('../users').testUsers;

var validUsers;
var invalidUser;

var del = {};

var userToken = {
  authorization: 'token ag-dubs'
};

module.exports = function(cb) {
  if (del.success) {
    return cb(null, del);
  }

  retrieveTestUsers(function(err, users) {
    if (err) { return cb(err); }

    validUsers = users.valid;
    invalidUser = users.invalid;

    del.success = {
      default: {
        headers: userToken,
        url: '/projects',
        payload: {
          title: 'Test project',
          user_id: validUsers[0].id,
          date_created: '01/01/15',
          date_updated: '01/01/15',
          description: 'A test project',
          tags: 'test, project, foo, whiz'
        },
        method: 'post'
      }
    };

    del.fail = {
      projectDoesNotExist: {
        headers: userToken,
        url: '/projects/999999',
        method: 'delete'
      },
      projectidTypeError: {
        headers: userToken,
        url: '/projects/thisisastring',
        method: 'delete'
      }
    };

    cb(null, del);
  });
};
