var Lab = require('lab');
var lab = exports.lab = Lab.script();

var experiment = lab.experiment;
var test = lab.test;
var before = lab.before;
var after = lab.after;
var expect = require('code').expect;

var config = require('../../../lib/fixtures/files').delete;
var server;

before(function(done) {
  require('../../../lib/mocks/server')(function(obj) {
    server = obj;

    config(function(err, del) {
      if (err) { throw err; }

      config = del;
      done();
    });
  });
});

after(function(done) {
  server.stop(done);
});

// DELETE /files/:id
experiment('[Delete a file by id]', function() {
  test('success case', function(done) {
    var opts = config.success.default;

    // Create, then attempt a delete of a file.
    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(201);

      server.inject({
        url: '/files/' + resp.result.id,
        method: 'delete',
        headers: {
          authorization: 'token ag-dubs'
        }
      }, function(resp) {
        expect(resp.statusCode).to.equal(204);

        done();
      });
    });
  });

  test('file must exist', function(done) {
    var opts = config.fail.fileDoesNotExist;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(404);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Not Found');

      done();
    });
  });

  test('file_id must be a number', function(done) {
    var opts = config.fail.fileidTypeError;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(400);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Bad Request');
      expect(resp.result.message).to.equal('`id` invalid');

      done();
    });
  });
});
