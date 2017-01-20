var create = {};

var userToken = {
  authorization: 'token TestUser'
};

module.exports = function(cb) {
  if (create.success) {
    return cb(null, create);
  }
  create.success = {
    default: {
      headers: userToken,
      url: '/users',
      method: 'post',
      payload: {
        name: 'TestUser'
      }
    }
  };

  create.fail = {
    nameAbsent: {
      headers: userToken,
      url: '/users',
      method: 'post',
      payload: {}
    },
    invalidName: {
      headers: userToken,
      url: '/users',
      method: 'post',
      payload: {
        name: 12345
      }
    }
  };

  cb(null, create);
};
