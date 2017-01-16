var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Form = require('../components/form/form.jsx');
var Header = require('../components/header/header.jsx');
var PasswordResetSuccess = require('../components/password-reset-success.jsx');
var WebmakerActions = require('../lib/webmaker-actions.jsx');
var Url = require('url');
var ga = require('react-ga');
var cookiejs = require('cookie-js');
var WebmakerActions = require('../lib/webmaker-actions.jsx');

require('es6-promise').polyfill();
require('isomorphic-fetch');

var fieldValues = [
  {
    'username': {
      'placeholder': 'Username',
      'type': 'text',
      'validator': 'username',
      'errorMessage': 'Invalid username'
    }
  },
  {
    'password': {
      'placeholder': 'Password',
      'type': 'password',
      'validator': 'password',
      'errorMessage': 'Invalid password'
    }
  }
];

var validators = require('../lib/validatorset');
var fieldValidators = validators.getValidatorSet(fieldValues);

// This wraps every view
var Login = React.createClass({
  componentDidMount: function() {
    document.title = "Webmaker Login - Login";
    WebmakerActions.addListener('FORM_VALIDATION', this.handleFormData);
  },
  componentWillUnmount: function() {
    WebmakerActions.deleteListener('FORM_VALIDATION', this.handleFormData);
  },
  getInitialState: function() {
    return {
      username: ''
    };
  },
  render: function() {
    // FIXME: totally not localized yet!
    var buttonText = "Log In";
    this.queryObj = Url.parse(window.location.href, true).query;

    var wrapperClass = "centerDiv";

    if (this.queryObj.passwordReset) {
      wrapperClass += " largeWrapper"
    }

    return (
      <div>
        <Header origin="Login" className="desktopHeader" redirectQuery={this.queryObj} />
        <Header origin="Login" className="mobileHeader" redirectLabel="Signup" redirectPage="signup" redirectQuery={this.queryObj} mobile />

        <div className={wrapperClass}>
          {this.queryObj.passwordReset ?
            <PasswordResetSuccess android={false}/> : false
          }

          <div className="loginPage innerForm">
            <Form ref="userform"
                  fields={fieldValues}
                  validators={fieldValidators}
                  origin="Login"
                  onInputBlur={this.handleBlur}
                  defaultUsername={this.queryObj.username}
            />
            <button onClick={this.processFormData} className="btn btn-awsm">{buttonText}</button>
            <Link onClick={this.handleGA.bind(this, 'Forgot your password')} to="reset-password" query={this.queryObj} className="need-help">Forgot your password?</Link>
          </div>
        </div>
      </div>
    );
  },
  processFormData: function(e) {
    e.preventDefault();
    var form = this.refs.userform;
    ga.event({category: 'Login', action: 'Start login'});
    form.processFormData(e);
  },
  handleGA: function(name) {
    ga.event({category: 'Login', action: 'Clicked on ' + name + ' link.'});
  },
  handleBlur: function(fieldName, value) {
    var userform = this.refs.userform;
    if ( fieldName === 'username' && value ) {
      this.queryObj.uid = value;
      userform.checkUid(value, fieldName);
    }
  },
  handleFormData: function(data) {
    var data = data.user;
    var error = data.err
    if ( error ) {
      ga.event({category: 'Login', action: 'Error during form validation'})
      console.error('validation error', error);
      return;
    }
    var csrfToken = cookiejs.parse(document.cookie).crumb;
    var queryObj = Url.parse(window.location.href, true).query;
    fetch('/login', {
      method: 'post',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        uid: data.username,
        password: data.password
      })
    }).then(function(response) {
      if ( response.status === 200 ) {
        WebmakerActions.validField({field: 'password'})
        var redirectObj = Url.parse('/login/oauth/authorize', true);
        redirectObj.query = {
          client_id: queryObj.client_id,
          response_type: queryObj.response_type,
          state: queryObj.state,
          scopes: queryObj.scopes
        };

        ga.event({category: 'Login', action: 'Logged in'});
        window.location = Url.format(redirectObj);
      }
      if( response.status === 401 ) {
        WebmakerActions.displayError({field: 'password', message: 'Invalid password.'})
      }
      // handle errors!
    }).catch(function(ex) {
      ga.event({category: 'Login', action: 'Error', label: 'Error with the server'});
      console.error('Error parsing response', ex);
    });
  }
});

module.exports = Login;
