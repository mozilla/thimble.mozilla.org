var React = require('react');

var Header = require('../components/header/header.jsx');
var LoginNoPasswordForm = require('../components/login-no-pass-form.jsx');
var KeyEmailed = require('../components/key-emailed.jsx');
var SetPasswordMigrationForm = require('../components/set-password-migration-form.jsx');
var IconText = require('../components/icontext.jsx');
var ga = require('react-ga');
var State = require("react-router").State;
var url = require('url');
var WebmakerActions = require('../lib/webmaker-actions.jsx');
var cookiejs = require('cookie-js');

require('es6-promise').polyfill();
require('isomorphic-fetch');

var UserMigration = React.createClass({
  mixins: [
    State
  ],
  componentDidMount: function() {
    document.title = "Webmaker Login - Set a Password";
  },
  getInitialState: function() {
    return {
      login: false,
      emailedKey: false,
      setPass: !!this.getQuery().token,
      success: false,
      errorMessage: null
    };
  },
  render: function() {
    var queryObj = this.getQuery();
    var content = (<LoginNoPasswordForm ref="LoginNoPasswordForm" submitForm={this.handleSendToken} uid={queryObj.uid}/>);
    var continueLink = url.parse('/login/oauth/authorize', true);
    continueLink.query = {
      client_id: queryObj.client_id,
      response_type: queryObj.response_type,
      state: queryObj.state,
      scopes: queryObj.scopes
    };

    if(this.state.emailedKey) {
      content = (<KeyEmailed ref="KeyEmailed" />);
    } else if(this.state.setPass) {
      content = (<SetPasswordMigrationForm ref="SetPasswordMigrationForm" submitForm={this.handleSetPassword} />);
    } else if(this.state.success) {
      content = (<div className="successBanner centerDiv"><IconText
          iconClass="successBannerIcon icon"
          className=""
          headerClass="successBannerHeader"
          header="Success!">
            <p>Thanks for setting your Webmaker password. From now on, use it to log in to your account.</p>
            <a className="continueLink" href={url.format(continueLink)}>Continue</a>
        </IconText></div>)
    }
    return (
      <div>
        <Header redirectQuery={queryObj} origin="Migration" className="desktopHeader"/>
        <Header redirectQuery={queryObj} origin="Migration" className="mobileHeader" redirectLabel="Signup" redirectPage="signup" mobile />
        {content}
      </div>
    );
  },
  handleSendToken: function(data) {
    var error = data.err;
    var data = data.user;
    if(error) {
      ga.event({category: 'Migration', action: 'Error', label: 'Error Handling Send Token'});
      console.error("inside App we see:", error, data);
      return;
    }
    var csrfToken = cookiejs.parse(document.cookie).crumb;
    var query = this.getQuery();
    delete query.uid;

    fetch('/request-migration-email', {
      method: "post",
      credentials: 'same-origin',
      headers: {
        "Accept": "application/json; charset=utf-8",
        "Content-Type": "application/json; charset=utf-8",
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        uid: data.uid,
        oauth: query
      })
    }).then((response) => {
      if ( response.status !== 200 ) {
        console.error("Non 200 status recieved while attemting migration", response.statusText);
        ga.event({category: 'Migration', action: 'Error', label: 'Error Handling Send Token'});
        return;
      }
      this.setState({
        login: false,
        emailedKey: true
      });
      ga.event({category: 'Migration', action: 'Request Token'});
    }).catch((ex) => {
      console.error("Exception requesting migration email", ex);
      ga.event({category: 'Migration', action: 'Error', label: 'Error Handling Send Token'});
    });
  },
  handleSetPassword: function(data) {
    var error = data.err;
    var data = data.user;
    if(error) {
      ga.event({category: 'Migration', action: 'Error', label: 'Error Handling Set Password'});
      return;
    }
    var csrfToken = cookiejs.parse(document.cookie).crumb;
    var query = this.getQuery();

    fetch('/migrate-user', {
      method: "post",
      credentials: 'same-origin',
      headers: {
        "Accept": "application/json; charset=utf-8",
        "Content-Type": "application/json; charset=utf-8",
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        token: query.token,
        uid: query.uid,
        password: data.password
      })
    }).then((response) => {
      if(response.status === 200) {
        this.setState({
          setPass: false,
          success: true
        });
        ga.event({category: 'Migration', action: 'Set new password'});
        window.setTimeout(() => {
          var redirectObj = Url.parse('/login/oauth/authorize', true);
          redirectObj.query = {
            client_id: this.getQuery().client_id,
            response_type: this.getQuery().response_type,
            state: this.getQuery().state,
            scopes: this.getQuery().scopes
          };

          window.location = url.format(redirectObj);
        }, 5000);
      }
      return response.json();
    }).then((json) => {
      if(!this.state.success) {
        if ( json.statusCode === 400 ) {
          WebmakerActions.displayError({'field': 'password', 'message': json.message});
          console.error("Error 400 statusCode recieved ", json.message);
          ga.event({category: 'Migration', action: 'Error', label: 'Error Handling Set Password'});
          return;
        }
        else if ( json.statusCode !== 200 ) {
          WebmakerActions.displayError({'field': 'password', 'message': 'Something went wrong. Try again!'});
          console.error("Non 200 statusCode recieved while attemting migration", json.message);
          ga.event({category: 'Migration', action: 'Error', label: 'Error Handling Set Password'});
          return;
        }
      }
    }).catch((ex) => {
      console.error("Exception Creating Password", ex);
      ga.event({category: 'Migration', action: 'Error', label: 'Error Handling Set Password'});
    });

  }
});

module.exports = UserMigration;
