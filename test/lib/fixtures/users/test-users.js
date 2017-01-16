var db = require('../../db');
var users = {};

users.invalid = {
  id: 'thisisastring',
  username: 1919
};

module.exports = function(cb) {
  db.select().from('users').orderBy('id')
  .then(function(rows) {
    users.valid = rows;
    cb(null, {
      valid: rows,
      invalid: {
        id: 'thisisastring',
        username: 1919
      }
    });
  })
  .catch(cb);
};
