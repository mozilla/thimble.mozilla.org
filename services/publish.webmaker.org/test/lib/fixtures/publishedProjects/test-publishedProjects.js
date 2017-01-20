var db = require('../../db');

module.exports = function(callback) {
  db.select().table('publishedProjects').orderBy('id')
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

    callback(null, {
      valid: rows,
      invalid: {
        id: 'thisisastring',
        title: 12345,
        date_created: 12345,
        date_updated: 12345
      }
    });
  })
  .catch(callback);
};
