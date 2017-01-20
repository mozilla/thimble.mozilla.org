var retrieveTestProjects = require('./test-projects');

var validProjects;
var invalidProject;

var getOne = {};

var userToken = {
  authorization: 'token ag-dubs'
};

module.exports = function(cb) {
  if (getOne.success) {
    return cb(null, getOne);
  }

  retrieveTestProjects(function(err, projects) {
    if (err) { return cb(err); }

    validProjects = projects.valid;
    invalidProject = projects.invalid;

    getOne.success = {
      default: {
        headers: userToken,
        url: '/projects/' + validProjects[0].id,
        method: 'get'
      }
    };

    getOne.fail = {
      invalidProjectid: {
        headers: userToken,
        url: '/projects/thisisastring',
        method: 'get'
      },
      projectDoesNotExist: {
        headers: userToken,
        url: '/projects/' + 9999999,
        method: 'get'
      }
    };

    cb(null, getOne);
  });
};
