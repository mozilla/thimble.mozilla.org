var Lab = require('lab');
var lab = exports.lab = Lab.script();

var experiment = lab.experiment;
var test = lab.test;
var before = lab.before;
var after = lab.after;
var expect = require('code').expect;

var config = require('../../../lib/fixtures/users').create;
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

// POST /users
experiment('[Create a user]', function() {
  test('success case', function(done) {
    var opts = config.success.default;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(201);
      expect(resp.result).to.exist();
      expect(resp.result.id).to.be.a.number();
      expect(resp.result.name).to.be.a.string();

      server.inject({
        url: '/users/' + resp.result.id,
        method: 'delete',
        headers: {
          authorization: 'token TestUser'
        }
      }, function (resp) {
        expect(resp.statusCode).to.equal(204);
        done();
      });
    });
  });

  test('name must exist', function(done) {
    var opts = config.fail.nameAbsent;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(400);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Bad Request');
      expect(resp.result.message).to.equal('`name` must be passed.');

      done();
    });
  });

  test('name must be a string', function(done) {
    var opts = config.fail.invalidName;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(400);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Bad Request');
      expect(resp.result.message).to.equal('`name` invalid');

      done();
    });
  });
});

