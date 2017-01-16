var retrieveTestFiles = require('./test-files');
var retrieveProjectFiles = require('../projects').testProjects;

var validFiles;
var invalidFile;

var validProjects;
var invalidProject;

var update = {};

var validHeaders = {
  authorization: 'token ag-dubs',
  'content-type': 'multipart/form-data; boundary=AaB03x'
};

function constructMultipartPayload(fields, data) {
  var payload = '';

  fields.forEach(function(field) {
    payload += '--AaB03x\r\n';
    payload += 'content-disposition: form-data; name="' + field.name + '"\r\n';
    payload += '\r\n' + field.content + '\r\n';
  });

  if (!data) {
    payload += '--AaB03x--\r\n';
    return payload;
  }

  payload += '--AaB03x\r\n';
  payload += 'content-disposition: form-data; name="' + data.name + '"; ';
  payload += 'filename="' + data.filename + '"\r\n';
  payload += 'Content-Type: ' + data.contentType + '\r\n';
  payload += '\r\n' + data.content + '\r\r\n';
  payload += '--AaB03x--\r\n';

  return payload;
}

module.exports = function(cb) {
  if (update.success) {
    return cb(null, update);
  }

  retrieveProjectFiles(function(err, projects) {
    if (err) { return cb(err); }

    validProjects = projects.valid;
    invalidProject = projects.invalid;

    retrieveTestFiles(function(err, files) {
      if (err) { return cb(err); }

      validFiles = files.valid;
      invalidFile = files.invalid;

      update.success = {
        default: {
          headers: validHeaders,
          url: '/files/' + validFiles[0].id,
          method: 'put',
          payload: constructMultipartPayload([
            {
              name: 'project_id',
              content: validProjects[0].id
            },
            {
              name: 'path',
              content: '/test.txt'
            }
          ], {
            name: 'buffer',
            filename: 'test.txt',
            contentType: 'text/plain',
            content: 'test data'
          })
        }
      };

      update.fail = {
        fileDoesNotExist: {
          headers: validHeaders,
          url: '/files/999999',
          method: 'put',
          payload: constructMultipartPayload([
            {
              name: 'project_id',
              content: validProjects[0].id
            },
            {
              name: 'path',
              content: '/test.txt'
            }
          ], {
            name: 'buffer',
            filename: 'test.txt',
            contentType: 'text/plain',
            content: 'test data'
          })
        },
        fileidTypeError: {
          headers: validHeaders,
          url: '/files/thisisastring',
          method: 'put',
          payload: constructMultipartPayload([
            {
              name: 'project_id',
              content: validProjects[0].id
            },
            {
              name: 'path',
              content: '/test.txt'
            }
          ], {
            name: 'buffer',
            filename: 'test.txt',
            contentType: 'text/plain',
            content: 'test data'
          })
        }
      };

      cb(null, update);
    });
  });
};
