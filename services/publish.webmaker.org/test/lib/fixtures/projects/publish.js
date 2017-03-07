var retrieveTestProjects = require('./test-projects');

var published = {};
var userToken = {
  authorization: 'token ag-dubs'
};

module.exports = function(cb) {
  if (published.success) {
    return cb(null, published);
  }

  retrieveTestProjects(function(err, projects) {
    if (err) { return cb(err); }

    var validProject = projects.valid[0];

    published.success = {
      readonlyQueryPassed: {
        headers: userToken,
        url: '/projects/' + validProject.id + '/publish?readonly=true',
        method: 'put'
      },
      inputData: {
        project: validProject
      }
    };

    cb(null, published);
  });
};
