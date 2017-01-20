var Lab = require('lab');
var lab = exports.lab = Lab.script();

var experiment = lab.experiment;
var test = lab.test;
var before = lab.before;
var after = lab.after;
var expect = require('code').expect;

var db = require('../../../lib/db');
var config = require('../../../lib/fixtures/projects').updatePaths;
var server;

before(function(done) {
  require('../../../lib/mocks/server')(function(obj) {
    server = obj;

    config(function(err, update) {
      if (err) { throw err; }

      config = update;
      done();
    });
  });
});

after(function(done) {
  server.stop(done);
});

function getFilePathsForProject(projectId) {
  return db.select().table('files')
  .then(function(rows) {
    var filePaths = [];

    rows.forEach(function(row) {
      if(row.project_id !== projectId) {
        return;
      }

      filePaths.push(row.path);
    });

    return filePaths;
  });
}

// PUT /projects/:project_id/updatepaths
experiment('[Update file paths for a project due to a folder rename]', function() {
  test('success case', function(done) {
    var opts = config.success.default;
    var filePathsUsed = config.success.filePathsUsed.valid;
    var oldPaths = Object.keys(filePathsUsed);
    var newPaths = oldPaths.map(function(oldPath) {
      return filePathsUsed[oldPath];
    });

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(200);

      getFilePathsForProject(config.success.projectId)
      .then(function(filePaths) {
        expect(filePaths).to.not.include(oldPaths);
        expect(filePaths).to.include(newPaths);

        done();
      })
      .catch(done);
    });
  });

  test('success case with extra non-existent paths', function(done) {
    var data = config.success;
    var opts = data.badPaths;
    var validFilePathsUsed = data.filePathsUsed.valid;
    var validOldPaths = Object.keys(validFilePathsUsed);
    var validNewPaths = validOldPaths.map(function(oldPath) {
      return validFilePathsUsed[oldPath];
    });
    var invalidFilePathsUsed = data.filePathsUsed.invalid;
    var invalidOldPaths = Object.keys(invalidFilePathsUsed);
    var invalidNewPaths = invalidOldPaths.map(function(oldPath) {
      return invalidFilePathsUsed[oldPath];
    });

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(200);

      getFilePathsForProject(data.projectId)
      .then(function(filePaths) {
        expect(filePaths).to.not.include(validOldPaths);
        expect(filePaths).to.include(validNewPaths);
        expect(filePaths).to.not.include(invalidOldPaths);
        expect(filePaths).to.not.include(invalidNewPaths);

        done();
      })
      .catch(done);
    });
  });

  test('project must exist', function(done) {
    var opts = config.fail.projectDoesNotExist;

    server.inject(opts, function(resp) {
      expect(resp.statusCode).to.equal(404);
      expect(resp.result).to.exist();
      expect(resp.result.error).to.equal('Not Found');

      done();
    });
  });
});
