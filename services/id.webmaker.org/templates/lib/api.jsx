var Router = require('react-router');
var WebmakerActions = require('./webmaker-actions.jsx');
var cookiejs = require('cookie-js');
var regex = require('./regex/regex.js');

var MIN_PASSWORD_LEN = 8;
var MAX_PASSWORD_LEN = 128;

require('es6-promise').polyfill();
require('isomorphic-fetch');

var csrfToken = cookiejs.parse(document.cookie).crumb;
module.exports = {
  checkUid: function(uid, fieldName) {
    fetch('/check-username', {
      method: 'post',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        uid: uid
      })
    }).then((response) => {
      return response.json();
    }).then((json) => {
      var query;
      var currentPath = this.getPathname().replace(/\/$/, "");
      var type = regex.email.test(uid) ? 'email address' : 'username';
      query = this.getQuery();
      query.uid = uid;
      if(json.statusCode === 404 && currentPath !== '/signup') {
        // user not found do something here!
        WebmakerActions.displayError({'field': fieldName, 'message': 'Whoops! We can\'t find an account with that ' + type + '!'});

      } else if (json.exists && currentPath === '/signup') {
        WebmakerActions.displayError({'field': fieldName, 'message': 'Username is taken!'});

      } else if (!json.exists) {
        WebmakerActions.validField({'field': fieldName, 'message': 'Available'});

      } else if ( json.usePasswordLogin && currentPath !== '/login'
                                        && currentPath !== '/reset-password'
                                        && currentPath !== '/signup') {
        this.transitionTo('/login', '', query );

      } else if ( !json.usePasswordLogin ) {
        this.transitionTo('/migrate', '', query );

      } else if (currentPath === '/login'){
        WebmakerActions.validField({'field': fieldName, 'message': 'Available'});
      }
    }).catch((ex) => {
      console.error("Request failed", ex);
    });
  },
  checkEmail: function(email) {
    fetch('/check-username', {
      method: 'post',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        uid: email
      })
    }).then((response) => {
      return response.json();
    }).then((json) => {
      if(json.exists) {
        WebmakerActions.displayError({'field': 'email', 'message': 'Email address already taken!'});
        this.setState({valid_email: false});
      } else if (!json.exists && this.state.valid_email) {
        this.setFormState({field: 'email'});
      }
    }).catch((ex) => {
      console.error("Request failed", ex);
    });
  },
  validatePassword: function(password) {
    var containsBothCases = regex.password.bothCases,
        containsDigit = regex.password.digit;

    var username = this.state.username || this.getQuery().uid || this.getQuery().username;

    var tooShort = password.length < MIN_PASSWORD_LEN,
        tooLong = password.length > MAX_PASSWORD_LEN,
        caseValid = !! password.match(containsBothCases),
        digitValid = !! password.match(containsDigit);

    if (tooShort) {
      WebmakerActions.displayError({'field': 'password', 'message': 'Password must be at least eight characters long.'});
    }
    if(tooLong) {
      WebmakerActions.displayError({'field': 'password', 'message': 'Password cannot be more than 128 characters long.'});
    }
    if (!caseValid) {
      WebmakerActions.displayError({'field': 'password', 'message': 'Password must contain at least one uppercase and lowercase letter.'});
    }
    if (!digitValid) {
      WebmakerActions.displayError({'field': 'password', 'message': 'Password must contain at least one number.'});
    }
    if (username) {
      var containUserValid = !password.match(username, 'i');
      if(!containUserValid) {
        WebmakerActions.displayError({'field': 'password', 'message': 'Password cannot contain your username.'});
      }
    } else if (!username) {
      WebmakerActions.displayError({'field': 'username', 'message': 'Please specify a username.'});
    }
    if(caseValid && digitValid && containUserValid && !tooShort && !tooLong) {
      this.setFormState({field: 'password'});
    }
  }
};
