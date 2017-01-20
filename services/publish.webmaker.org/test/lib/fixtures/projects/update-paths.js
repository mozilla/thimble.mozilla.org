var path = require('path');

var retrieveTestProjects = require('./test-projects');

var retrieveTestFiles = require('../files/test-files');

var updatePaths = {};
var userToken = {
  authorization: 'token ag-dubs'
};

module.exports = function(cb) {
  if (updatePaths.success) {
    return cb(null, updatePaths);
  }

  retrieveTestProjects(function(err, projects) {
    if (err) { return cb(err); }

    var validProject = projects.valid[0];

    retrieveTestFiles(function(err, files) {
      if (err) { return cb(err); }

      var validFiles = {};
      var invalidFiles = {
        '/this/path/is/invalid': '/should/be/ignored'
      };

      files.valid.forEach(function(file) {
        if(file.project_id !== validProject.id) {
          return;
        }

        validFiles[file.path] = path.join('/renamedfolder', file.path);
      });

      var validAndInvalidFiles = Object.assign({}, validFiles, invalidFiles);

      updatePaths.success = {
        default: {
          headers: userToken,
          url: '/projects/' + validProject.id + '/updatepaths',
          method: 'put',
          payload: validFiles
        },
        badPaths: {
          headers: userToken,
          url: '/projects/' + validProject.id + '/updatepaths',
          method: 'put',
          payload: validAndInvalidFiles
        },
        projectId: validProject.id,
        filePathsUsed: {
          valid: validFiles,
          invalid: invalidFiles
        }
      };

      updatePaths.fail = {
        projectDoesNotExist: {
          headers: userToken,
          url: '/projects/999999/updatepaths',
          method: 'put',
          payload: validFiles
        }
      };

      cb(null, updatePaths);
    });
  });
};
