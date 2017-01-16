var Lab = require('lab');
var lab = exports.lab = Lab.script();

var experiment = lab.experiment;
var test = lab.test;
var before = lab.before;
var after = lab.after;
var expect = require('code').expect;

var config = require('../../../lib/fixtures/projects').getOne;
var server;

var validDateResponse = require('../../../lib/utils').validDateResponse;

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

// GET /project/:project_id
experiment('[Get one project]', function() {
  test('success case', function(done) {
    var opts = config.success.default;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(200);

      expect(resp.result).to.exist();
      expect(resp.result.id).to.be.a.number();
      expect(resp.result.user_id).to.be.a.number();
      expect(resp.result.date_created).to.satisfy(validDateResponse);
      expect(resp.result.date_updated).to.satisfy(validDateResponse);
      expect(resp.result.title).to.be.a.string();
      expect(resp.result.tags).to.be.a.string();

      done();
    });
  });

  test('project_id must be a number', function(done) {
    var opts = config.fail.invalidProjectid;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(400);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Bad Request');
      expect(resp.result.message).to.be.a.string();

      done();
    });
  });

  test('project_id must represent an existing resource', function(done) {
    var opts = config.fail.projectDoesNotExist;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(404);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Not Found');

      done();
    });
  });
});
