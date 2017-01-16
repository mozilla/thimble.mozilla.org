var retrieveTestUsers = require('../users').testUsers;

var validUsers;
var invalidUser;

var create = {};

var userToken = {
  authorization: 'token ag-dubs'
};

module.exports = function(cb) {
  if (create.success) {
    return cb(null, create);
  }

  retrieveTestUsers(function(err, users) {
    if (err) { return cb(err); }

    validUsers = users.valid;
    invalidUser = users.invalid;

    create.success = {
      default: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 'Test project',
          user_id: validUsers[0].id,
          date_created: '01/01/15',
          date_updated: '01/01/15',
          description: 'A test project',
          tags: 'test, project, foo, whiz',
          readonly: false,
          client: 'test runner'
        }
      }
    };

    create.fail = {
      userDoesNotExist: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 'Test project',
          user_id: 999999,
          date_created: '01/01/15',
          date_updated: '01/01/15',
          description: 'A test project',
          tags: 'test, project, foo, whiz',
          readonly: false,
          client: 'test runner'
        }
      },

      useridTypeError: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 'Test project',
          user_id: 'thisisastring',
          date_created: '01/01/15',
          date_updated: '01/01/15',
          description: 'A test project',
          tags: 'test, project, foo, whiz',
          readonly: false,
          client: 'test runner'
        }
      },
      titleTypeError: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 123,
          user_id: validUsers[0].id,
          date_created: '01/01/15',
          date_updated: '01/01/15',
          description: 'A test project',
          tags: 'test, project, foo, whiz',
          readonly: false,
          client: 'test runner'
        }
      },
      dateCreatedTypeError: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 'Test project',
          user_id: validUsers[0].id,
          date_created: 'This is an invalid date',
          date_updated: '01/01/15',
          description: 'A test project',
          tags: 'test, project, foo, whiz',
          readonly: false,
          client: 'test runner'
        }
      },
      dateUpdatedTypeError: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 'Test project',
          user_id: validUsers[0].id,
          date_created: '01/01/15',
          date_updated: 'This is an invalid date',
          description: 'A test project',
          tags: 'test, project, foo, whiz',
          readonly: false,
          client: 'test runner'
        }
      },
      descriptionTypeError: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 'Test project',
          user_id: validUsers[0].id,
          date_created: '01/01/15',
          date_updated: '01/01/15',
          description: 123,
          tags: 'test, project, foo, whiz',
          readonly: false,
          client: 'test runner'
        }
      },
      tagsTypeError: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 'Test project',
          user_id: validUsers[0].id,
          date_created: '01/01/15',
          date_updated: '01/01/15',
          description: 'A test project',
          tags: 123,
          readonly: false,
          client: 'test runner'
        }
      },
      readonlyTypeError: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 'Test project',
          user_id: validUsers[0].id,
          date_created: '01/01/15',
          date_updated: '01/01/15',
          description: 'A test project',
          tags: 'test, project, foo, whiz',
          readonly: 12345,
          client: 'test runner'
        }
      },
      clientTypeError: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 'Test project',
          user_id: validUsers[0].id,
          date_created: '01/01/15',
          date_updated: '01/01/15',
          description: 'A test project',
          tags: 'test, project, foo, whiz',
          readonly: false,
          client: 12345
        }
      },

      payloadAbsent: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {}
      },
      useridAbsent: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 'Test project',
          date_created: '01/01/15',
          date_updated: '01/01/15',
          description: 'A test project',
          tags: 'test, project, foo, whiz',
          readonly: false,
          client: 'test runner'
        }
      },
      titleAbsent: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          user_id: validUsers[0].id,
          date_created: '01/01/15',
          date_updated: '01/01/15',
          description: 'A test project',
          tags: 'test, project, foo, whiz',
          readonly: false,
          client: 'test runner'
        }
      },
      dateCreatedAbsent: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 'Test project',
          user_id: validUsers[0].id,
          date_updated: '01/01/15',
          description: 'A test project',
          tags: 'test, project, foo, whiz',
          readonly: false,
          client: 'test runner'
        }
      },
      dateUpdatedAbsent: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 'Test project',
          user_id: validUsers[0].id,
          date_created: '01/01/15',
          description: 'A test project',
          tags: 'test, project, foo, whiz',
          readonly: false,
          client: 'test runner'
        }
      },
      tagsAbsent: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 'Test project',
          user_id: validUsers[0].id,
          date_created: '01/01/15',
          date_updated: '01/01/15',
          description: 'A test project',
          readonly: false,
          client: 'test runner'
        }
      },
      readonlyAbsent: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 'Test project',
          user_id: validUsers[0].id,
          date_created: '01/01/15',
          date_updated: '01/01/15',
          description: 'A test project',
          tags: 'test, project, foo, whiz',
          client: 'test runner'
        }
      },
      clientAbsent: {
        headers: userToken,
        url: '/projects',
        method: 'post',
        payload: {
          title: 'Test project',
          user_id: validUsers[0].id,
          date_created: '01/01/15',
          date_updated: '01/01/15',
          description: 'A test project',
          tags: 'test, project, foo, whiz',
          readonly: false
        }
      }
    };

    cb(null, create);
  });
};
