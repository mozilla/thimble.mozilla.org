var db = require('../../db');

module.exports = function(cb) {
  db.select().table('files').orderBy('id')
  .then(function(rows) {
    cb(null, {
      valid: rows,
      invalid: {
        id: 'thisisastring',
        project_id: 'thisisastring',
        path: 123,
        buffer: 'thisisastring'
      }
    });
  })
  .catch(cb);
};
