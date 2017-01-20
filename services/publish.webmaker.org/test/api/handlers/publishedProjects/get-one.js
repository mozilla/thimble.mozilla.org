var Lab = require('lab');
var lab = exports.lab = Lab.script();

var experiment = lab.experiment;
var test = lab.test;
var before = lab.before;
var after = lab.after;
var expect = require('code').expect;

var config = require('../../../lib/fixtures/publishedProjects').getOne;
var server;

var validDateResponse = require('../../../lib/utils').validDateResponse;

before(function(done) {
  require('../../../lib/mocks/server')(function(testServer) {
    server = testServer;

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

// GET /publishedProjects/:publishedProject_id
experiment('[Get one published project]', function() {
  test('success case', function(done) {
    var options = config.success.default;

    server.inject(options, function(response) {
      expect(response.statusCode).to.equal(200);

      expect(response.result).to.exist();
      expect(response.result.id).to.be.a.number();
      expect(response.result.title).to.be.a.string();
      expect(response.result.tags).to.be.a.string();
      expect(response.result.description).to.be.a.string();
      expect(response.result.date_created).to.satisfy(validDateResponse);
      expect(response.result.date_updated).to.satisfy(validDateResponse);

      done();
    });
  });

  test('publishedProject_id must be a number', function(done) {
    var options = config.fail.invalidPublishedProjectId;

    server.inject(options, function(response) {
      expect(response.statusCode).to.equal(400);
      expect(response.result).to.exist();
      expect(response.result.error).to.equal('Bad Request');
      expect(response.result.message).to.be.a.string();

      done();
    });
  });

  test('publishedProject_id must represent an existing resource', function(done) {
    var options = config.fail.publishedProjectDoesNotExist;

    server.inject(options, function(response) {
      expect(response.statusCode).to.equal(404);
      expect(response.result).to.exist();
      expect(response.result.error).to.equal('Not Found');

      done();
    });
  });
});
