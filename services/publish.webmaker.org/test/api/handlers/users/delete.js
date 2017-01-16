var Lab = require('lab');
var lab = exports.lab = Lab.script();

var experiment = lab.experiment;
var test = lab.test;
var before = lab.before;
var after = lab.after;
var expect = require('code').expect;

var config = require('../../../lib/fixtures/users').delete;
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

// DELETE /users/:id
experiment('[Delete a user by id]', function() {
  test('success case', function(done) {
    server.inject({
      url: '/users',
      method: 'post',
      payload: {
        name: 'TestUser'
      },
      headers: {
        authorization: 'token TestUser'
      }
    }, function(resp) {
      expect(resp.statusCode).to.equal(201);

      server.inject({
        url: '/users/' + resp.result.id,
        method: 'delete',
        headers: {
          authorization: 'token TestUser'
        }
      }, function(resp) {
        expect(resp.statusCode).to.equal(204);

        done();
      });
    });
  });

  test('user must exist', function(done) {
    var opts = config.fail.userDoesNotExist;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(404);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Not Found');

      done();
    });
  });

  test('user_id must be a number', function(done) {
    var opts = config.fail.useridTypeError;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(400);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Bad Request');
      expect(resp.result.message).to.equal('`id` invalid');

      done();
    });
  });
});
