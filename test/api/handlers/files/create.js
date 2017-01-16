var Lab = require('lab');
var lab = exports.lab = Lab.script();

var experiment = lab.experiment;
var test = lab.test;
var before = lab.before;
var after = lab.after;
var expect = require('code').expect;

var config = require('../../../lib/fixtures/files').create;
var server;

before(function(done) {
  require('../../../lib/mocks/server')(function(obj) {
    server = obj;

    config(function(err, create) {
      if (err) { throw err; }

      config = create;
      done();
    });
  });
});

after(function(done) {
  server.stop(done);
});

// POST /files
experiment('[Create a file]', function() {
  test('success case', function(done) {
    var opts = config.success.default;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(201);
      expect(resp.result).to.exist();
      expect(resp.result.id).to.be.a.number();
      expect(resp.result.project_id).to.be.a.number();
      expect(resp.result.path).to.be.a.string();
      expect(resp.result.buffer).not.to.exist();

      server.inject({
        url: '/files/' + resp.result.id,
        method: 'delete',
        headers: {
          authorization: 'token ag-dubs'
        }
      }, function (resp) {
        expect(resp.statusCode).to.equal(204);
        done();
      });
    });
  });

  test('associated project must exist', function(done) {
    var opts = config.fail.projectDoesNotExist;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(404);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Not Found');

      done();
    });
  });

  test('project_id must be a valid type', function(done) {
    var opts = config.fail.projectidTypeError;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(400);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Bad Request');
      expect(resp.result.message).to.equal('`project_id` invalid');

      done();
    });
  });

  test('project_id must exist', function(done) {
    var opts = config.fail.projectidAbsent;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(400);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Bad Request');
      expect(resp.result.message).to.equal('`project_id` must be passed.');

      done();
    });
  });

  test('path must exist', function(done) {
    var opts = config.fail.pathAbsent;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(400);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Bad Request');
      expect(resp.result.message).to.equal('`path` must be passed.');

      done();
    });
  });

  test('buffer must exist', function(done) {
    var opts = config.fail.dataAbsent;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(400);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Bad Request');
      expect(resp.result.message).to.equal('`buffer` must be passed.');

      done();
    });
  });
});
