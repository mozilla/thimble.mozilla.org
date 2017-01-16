var Lab = require('lab');
var lab = exports.lab = Lab.script();

var experiment = lab.experiment;
var test = lab.test;
var before = lab.before;
var after = lab.after;
var expect = require('code').expect;

var config = require('../../../lib/fixtures/files').getAllByProject;
var server;

before(function(done) {
  require('../../../lib/mocks/server')(function(obj) {
    server = obj;
    config(function(err, getAllByProject) {
      if (err) { throw err; }

      config = getAllByProject;
      done();
    });
  });
});

after(function(done) {
  server.stop(done);
});

// GET /projects/:projectid/files
experiment('[Get all files in a project]', function() {
  test('success case', function(done) {
    var opts = config.success.default;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(200);
      expect(resp.result).to.be.an.array();

      done();
    });
  });

  test('project_id must reference an existing project', function(done) {
    var opts = config.fail.projectDoesNotExist;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(404);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Not Found');

      done();
    });
  });

  test('project_id must be a number', function(done) {
    var opts = config.fail.invalidProjectId;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(400);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Bad Request');
      expect(resp.result.message).to.equal('`id` invalid');

      done();
    });
  });
});
