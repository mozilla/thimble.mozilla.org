var React = require('react');
var validators = require('../lib/validatorset');
var Form = require('./form/form.jsx');
var IconText = require('./icontext.jsx');
var WebmakerActions = require('../lib/webmaker-actions.jsx');

var fields = [
  {
    'password': {
      'placeholder': 'Enter your new password',
      'type': 'password',
      'validator': 'password'
    }
  }
];

var fieldsValidators = validators.getValidatorSet(fields);

var SetPasswordMigration = React.createClass({
  componentWillMount: function() {
    WebmakerActions.addListener('FORM_VALIDATION', this.handleFormData);
  },
  componentWillUnmount: function() {
    WebmakerActions.deleteListener('FORM_VALIDATION', this.handleFormData);
  },
  render: function() {
    return (
      <div className="migrateKeyContainer centerDiv">
        <IconText
          iconClass="emailSentIcon fa fa-lock"
          className="emailSent arrow_box"
          headerClass="emailSentHeader"
          header="Set your password">
            <p>Please create a password for your account.</p>
        </IconText>
        <div className="migrateKey innerForm">
          <Form defaultUsername={this.props.uid}
                origin="Set password migration"
                ref="userform"
                fields={fields}
                validators={fieldsValidators}
                onInputBlur={this.handleBlur}
          />
          <button type="submit" onClick={this.processFormData} className="btn btn-awsm">Continue</button>
        </div>
      </div>
    );
  },
  handleFormData: function(data) {
    this.props.submitForm(data);
  },
  processFormData: function(e) {
    var form = this.refs.userform;
    form.processFormData(e);
  },
  handleBlur: function(fieldName, value) {
    if ( fieldName === 'password' && value ) {
      this.refs.userform.validatePassword(value);
    }
  }
});

module.exports = SetPasswordMigration;
