var React = require('react');
var validators = require('../lib/validatorset');
var Form = require('./form/form.jsx');
var WebmakerActions = require('../lib/webmaker-actions.jsx');

var fields = [
  {
    'username': {
      'placeholder': 'Username',
      'type': 'text',
      'validator': 'username',
      'disabled': true,
      'checked': true
    }
  }, {
    'password': {
      'placeholder': 'Type your new password',
      'type': 'password',
      'validator': 'password',
      'errorMessage': 'Invalid password',
      'focus': true
    }
  }
];

var fieldsValidators = validators.getValidatorSet(fields);

var ResetPassword = React.createClass({
  componentWillMount: function() {
    WebmakerActions.addListener('FORM_VALIDATION', this.handleFormData);
  },
  componentWillUnmount: function() {
    WebmakerActions.deleteListener('FORM_VALIDATION', this.handleFormData);
  },
  render: function() {
    return (
      <div className="resetPassword innerForm centerDiv">
        <Form ref="userform"
              fields={fields}
              origin="Set password"
              validators={fieldsValidators}
              defaultUsername={this.props.username}
              onInputBlur={this.handleBlur}
        />
        <button type="submit" onClick={this.processFormData} className="btn btn-awsm">Save</button>
      </div>
    );
  },
  processFormData: function(e) {
    var form = this.refs.userform;
    form.processFormData(e);
  },
  handleFormData: function(data) {
    this.props.submitForm(data);
  },
  handleBlur: function(fieldName, value) {
    if ( fieldName === 'password' && value ) {
      this.refs.userform.validatePassword(value);
    }
  }
});

module.exports = ResetPassword;
