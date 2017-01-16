var SCOPES = {
  user: [
    'username',
    'avatar',
    'id',
    'prefLocale'
  ],
  email: [
    'email'
  ]
};

module.exports = {
  filterUserForScopes: function(user, scopes) {
    var filtered = {};

    scopes.forEach(function(scope) {
      var scopeAttrs = SCOPES[scope];
      if ( scopeAttrs ) {
        scopeAttrs.forEach(function(attr) {
          filtered[attr] = user[attr];
        });
      }
    });

    filtered.scope = scopes;

    return filtered;
  }
};
