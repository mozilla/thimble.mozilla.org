var retrieveTestProjects = require('../projects').testProjects;

var validProjects;
var invalidProject;

var del = {};

var userToken = {
  authorization: 'token ag-dubs'
};

var createHeaders = {
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
  if (del.success) {
    return cb(null, del);
  }

  retrieveTestProjects(function(err, projects) {
    if (err) { return cb(err); }

    validProjects = projects.valid;
    invalidProject = projects.invalid;

    // This is used to create a file record, which is then
    // deleted.
    del.success = {
      default: {
        headers: createHeaders,
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

    del.fail = {
      fileDoesNotExist: {
        headers: userToken,
        url: '/files/999999',
        method: 'delete'
      },
      fileidTypeError: {
        headers: userToken,
        url: '/files/thisisastring',
        method: 'delete'
      }
    };

    cb(null, del);
  });
};
