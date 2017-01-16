var retrieveTestFiles = require('../files/test-files');
var retrieveProjectFiles = require('../projects').testProjects;

var validFiles;
var invalidFile;

var validProjects;
var invalidProject;

var getAllByProject = {};

var userToken = {
  authorization: 'token ag-dubs'
};

module.exports = function(cb) {
  if (getAllByProject.success) {
    return cb(null, getAllByProject);
  }

  retrieveTestFiles(function(err, files) {
    if (err) { return cb(err); }

    validFiles = files.valid;
    invalidFile = files.invalid;

    retrieveProjectFiles(function(err, projects) {
      if (err) { return cb(err); }

      validProjects = projects.valid;
      invalidProject = projects.invalid;

      getAllByProject.success = {
        default: {
          headers: userToken,
          url: '/projects/' + validProjects[0].id + '/files',
          method: 'get'
        }
      };

      getAllByProject.fail = {
        projectDoesNotExist: {
          headers: userToken,
          url: '/projects/' + 9999999 + '/files',
          method: 'get'
        },
        invalidProjectId: {
          headers: userToken,
          url: '/projects/' + invalidProject.id + '/files',
          method: 'get'
        }
      };

      cb(null, getAllByProject);
    });
  });
};
