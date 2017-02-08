var Lab = require('lab');
var lab = exports.lab = Lab.script();

var experiment = lab.experiment;
var test = lab.test;
var before = lab.before;
var after = lab.after;
var expect = require('code').expect;

var db = require('../../../lib/db');
var config = require('../../../lib/fixtures/projects').publish;
var server;

before(function(done) {
  require('../../../lib/mocks/server')(function(obj) {
    server = obj;

    config(function(err, published) {
      if (err) { throw err; }

      config = published;
      done();
    });
  });
});

after(function(done) {
  server.stop(done);
});

function getProjectFromDb(projectId) {
  return db
  .where('id', projectId)
  .select()
  .table('projects')
  .then(function(rows) {
    return rows[0];
  });
}

// PUT /projects/:project_id/publish?readonly=<value>
experiment('[Publish a project (readonly query)]', function() {
  test('readonly query paramater passed in', function(done) {
    var opts = config.success.readonlyQueryPassed;
    var project = config.success.inputData.project;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(200);

      getProjectFromDb(project.id)
      .then(function(projectData) {
        expect(projectData.readonly).not.to.equal(project.readonly);

        done();
      })
      .catch(done);
    });
  });
});
