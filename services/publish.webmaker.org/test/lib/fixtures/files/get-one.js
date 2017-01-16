var retrieveTestFiles = require('../files/test-files');

var validFiles;
var invalidFile;

var getOne = {};

var userToken = {
  authorization: 'token ag-dubs'
};

module.exports = function(cb) {
  if (getOne.success) {
    return cb(null, getOne);
  }

  retrieveTestFiles(function(err, files) {
    if (err) { return cb(err); }

    validFiles = files.valid;
    invalidFile = files.invalid;

    getOne.success = {
      default: {
        headers: userToken,
        url: '/files/' + validFiles[0].id,
        method: 'get'
      }
    };

    getOne.fail = {
      invalidFileid: {
        headers: userToken,
        url: '/files/' + invalidFile.id,
        method: 'get'
      },
      fileDoesNotExist: {
        headers: userToken,
        url: '/files/' + 9999999,
        method: 'get'
      }
    };

    cb(null, getOne);
  });
};
