var retrieveTestProjects = require('../projects').testProjects;
var retrieveTestFiles = require('./test-files');

var validProjects;
var invalidProject;

var validFiles;

var create = {};

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
  if (create.success) {
    return cb(null, create);
  }

  retrieveTestFiles(function(err, files) {
    if (err) { return cb(err); }

    validFiles = files.valid;

    retrieveTestProjects(function(err, projects) {
      if (err) { return cb(err); }

      validProjects = projects.valid;
      invalidProject = projects.invalid;

      create.success = {
        default: {
          headers: validHeaders,
          url: '/files',
          method: 'post',
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

      create.fail = {
        projectDoesNotExist: {
          headers: validHeaders,
          url: '/files',
          method: 'post',
          payload: constructMultipartPayload([
            {
              name: 'project_id',
              content: 9999999
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
        projectidTypeError: {
          headers: validHeaders,
          url: '/files',
          method: 'post',
          payload: constructMultipartPayload([
            {
              name: 'project_id',
              content: 'thisisastring'
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
        pathTypeError: {
          headers: validHeaders,
          url: '/files',
          method: 'post',
          payload: constructMultipartPayload([
            {
              name: 'project_id',
              content: validProjects[0].id
            },
            {
              name: 'path',
              content: 1234
            }
          ], {
            name: 'buffer',
            filename: 'test.txt',
            contentType: 'text/plain',
            content: 'test data'
          })
        },
        payloadAbsent: {
          headers: validHeaders,
          url: '/files',
          method: 'post',
          payload: {}
        },
        projectidAbsent: {
          headers: validHeaders,
          url: '/files',
          method: 'post',
          payload: constructMultipartPayload([
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
        pathAbsent: {
          headers: validHeaders,
          url: '/files',
          method: 'post',
          payload: constructMultipartPayload([
            {
              name: 'project_id',
              content: validProjects[0].id
            }
          ], {
            name: 'buffer',
            filename: 'test.txt',
            contentType: 'text/plain',
            content: 'test data'
          })
        },
        dataAbsent: {
          headers: validHeaders,
          url: '/files',
          method: 'post',
          payload: constructMultipartPayload([
            {
              name: 'project_id',
              content: validProjects[0].id
            },
            {
              name: 'path',
              content: '/test.txt'
            }
          ])
        },
        duplicatePath: {
          headers: validHeaders,
          url: '/files',
          method: 'post',
          payload: constructMultipartPayload([
            {
              name: 'project_id',
              content: validProjects[0].id
            },
            {
              name: 'path',
              content: validFiles[0].path
            }
          ], {
            name: 'buffer',
            filename: 'test.txt',
            contentType: 'text/plain',
            content: 'test data'
          })
        }
      };

      cb(null, create);
    });
  });
};
