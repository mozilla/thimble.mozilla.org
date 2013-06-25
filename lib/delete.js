/**
 * Deletion code path, for removing projects from the database
 */
module.exports = function(db, env) {
  return {
    delete: function(id) {
      db.delete({id: id});
    }
  };
};
