var React = require('react');

var Form = require('../components/form/form.jsx');
var Header = require('../components/header/header.jsx');
var IconText = require('../components/icontext.jsx');
var Router = require('react-router');
var cookiejs = require('cookie-js');
var WebmakerActions = require('../lib/webmaker-actions.jsx');
var Url = require('url');
var ga = require('react-ga');
require('es6-promise').polyfill();
require('isomorphic-fetch');

var fieldValues = [
  {
    'username': {
      'placeholder': 'Username',
      'type': 'text',
      'validator': 'username',
      'label': false,
      'tabIndex': '1'
    }
  },
  {
    'email': {
      'placeholder': 'Email',
      'type': 'email',
      'validator': 'email',
      'label': false,
      'tabIndex': '2'
    }
  },
  {
    'password': {
      'placeholder': 'Password',
      'type': 'password',
      'validator': 'password',
      'label': false,
      'tabIndex': '3'
    }
  },
  {
    'feedback': {
      'label': 'Tell me about Mozilla news & events',
      'labelPosition': 'after',
      'type': 'checkbox',
      'className': 'checkBox',
      'tabIndex': '4'
    }
  }
];

var validators = require('../lib/validatorset');
var fieldValidators = validators.getValidatorSet(fieldValues);

var Signup = React.createClass({
  componentDidMount: function() {
    document.title = "Webmaker Login - Sign Up";
    document.body.className = "signup-bg";
    WebmakerActions.addListener('FORM_ERROR', this.setFormState);
    WebmakerActions.addListener('FORM_VALIDATION', this.handleFormData);
  },
  componentWillUnmount: function() {
    document.body.className = "";
    WebmakerActions.deleteListener('FORM_ERROR', this.setFormState);
    WebmakerActions.deleteListener('FORM_VALIDATION', this.handleFormData);
  },
  render: function() {
    var queryObj = Url.parse(window.location.href, true).query;
    return (
      <div className="signup-page">
        <Header origin="Signup" className="desktopHeader" redirectText="Already have an account?" redirectLabel="Log in" redirectPage="login" redirectQuery={queryObj} />
        <Header origin="Signup" className="mobileHeader" redirectLabel="Log in" redirectPage="login" redirectQuery={queryObj} mobile />

        <h1>Build the web. Learn new skills.</h1>
        <h2>Free and open source – forever.</h2>
        <div className="innerForm">
          <Form ref="userform"
                fields={fieldValues}
                validators={fieldValidators}
                origin="Signup"
                onInputBlur={this.handleBlur}
                autoComplete="off"
          />
        </div>
        <div className="commit">
          <IconText iconClass="agreement" textClass="eula">
            By signing up, I agree to Webmaker&lsquo;s <a tabIndex="5" href="//beta.webmaker.org/#/legal" className="underline">Terms of Service</a> and <a tabIndex="6" href="//www.mozilla.org/privacy/websites" className="underline">Privacy Policy</a>.
          </IconText>
          <div className="signup-button"><button type="submit" tabIndex="7" className="btn btn-awsm" onClick={this.processSignup}>SIGN UP</button></div>
        </div>
      </div>
    );
  },
  setFormState: function(data) {
    this.refs.userform.setState({['valid_' +data.field]: false});
  },
  processSignup: function(evt) {
    this.refs.userform.processFormData(evt);
  },
  handleBlur: function(fieldName, value) {
    var userform = this.refs.userform;
    if ( fieldName === 'email' && value ) {
      userform.checkEmail(value);
    }
    if( fieldName === 'username' && value ) {
      userform.checkUid(value, fieldName);
    }
    if( fieldName === 'password' && value ) {
      userform.validatePassword(value);
    }
  },
  handleFormData: function(data) {
    var error = data.err;
    var data = data.user;
    if ( error ) {
      ga.event({category: 'Signup', action: 'Error during form validation'});
      console.error("validation error", error);
      return;
    }

    var userform = this.refs.userform;
    var csrfToken = cookiejs.parse(document.cookie).crumb;
    var queryObj = Url.parse(window.location.href, true).query;

    userform.validatePassword(data.password);
    fetch("/create-user", {
      method: "post",
      credentials: 'same-origin',
      headers: {
        "Accept": "application/json; charset=utf-8",
        "Content-Type": "application/json; charset=utf-8",
        "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify({
        email: data.email,
        username: data.username,
        password: data.password,
        feedback: data.feedback,
        client_id: queryObj.client_id,
        lang: navigator.language
      })
    }).then(function(response) {
      if ( response.status === 200 ) {
        var redirectObj = Url.parse("/login/oauth/authorize", true);
        redirectObj.query = {
          client_id: queryObj.client_id,
          response_type: queryObj.response_type,
          state: queryObj.state,
          scopes: queryObj.scopes
        };

        ga.event({category: 'Signup', action: 'Successfully created an account'});
        window.location = Url.format(redirectObj);
      }
    }).catch(function(ex) {
      ga.event({category: 'Signup', action: 'Error', label: 'Error parsing response from the server'});
      console.error("Error parsing response", ex);
    });

  }

});

module.exports = Signup;
