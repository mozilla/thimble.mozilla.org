var Lab = require('lab');
var lab = exports.lab = Lab.script();

var experiment = lab.experiment;
var test = lab.test;
var before = lab.before;
var after = lab.after;
var expect = require('code').expect;

var config = require('../../../lib/fixtures/files').getOne;
var server;

before(function(done) {
  require('../../../lib/mocks/server')(function(obj) {
    server = obj;

    config(function(err, getOne) {
      if (err) { throw err; }

      config = getOne;
      done();
    });
  });
});

after(function(done) {
  server.stop(done);
});

// GET /files/:fileid
experiment('[Get one file]', function() {
  test('success case', function(done) {
    var opts = config.success.default;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(200);
      expect(resp.result).to.exist();
      expect(resp.result.id).to.be.a.number();
      expect(resp.result.project_id).to.be.a.number();
      expect(resp.result.path).to.be.a.string();
      expect(resp.result.buffer).to.be.a.buffer();

      done();
    });
  });

  test('file_id must be a number', function(done) {
    var opts = config.fail.invalidFileid;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(400);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Bad Request');
      expect(resp.result.message).to.be.a.string();

      done();
    });
  });

  test('file_id must represent an existing resource', function(done) {
    var opts = config.fail.fileDoesNotExist;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(404);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Not Found');

      done();
    });
  });
});
