var db = require('../../db');

module.exports = function(cb) {
  db.select().table('projects').orderBy('id')
  .then(function(rows) {
    rows.forEach(function(row) {
      if (row._date_created) {
        row.date_created = row._date_created.toISOString();
        delete row._date_created;
      }
      if (row._date_updated) {
        row.date_updated = row._date_updated.toISOString();
        delete row._date_updated;
      }
    });

    cb(null, {
      valid: rows,
      invalid: {
        id: 'thisisastring',
        title: 12345,
        username: 23241,
        isPublic: null
      }
    });
  })
  .catch(cb);
};
