module.exports = {
  slugify: function(s) {
    return s.toLowerCase().replace(/[^\w\s]+/g,'').replace(/\s+/g,'-');
  },

  error: function( code, msg ) {
    var err = new Error( msg || http.STATUS_CODES[ code ]);
    err.status = code;
    return err;
  }
};
