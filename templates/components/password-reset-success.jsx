var React = require('react');
var IconText = require('./icontext.jsx');

var PasswordResetSuccess = React.createClass({
  render: function() {
    var message = (
      <p>Sign in with your password below</p>
    );

    if (this.props.android) {
      message = (
        <p>
          <span>
            If you are not automatically sent back to webmaker
            <a href="webmaker://login?mode=sign-in"> click here</a>
          </span>
        </p>
      );
    }

    return (
      <IconText
        iconClass="passwordResetIcon fa fa-check"
        className="passwordResetSuccess"
        header="Success! Your password has been reset."
        headerClass="passwordResetHeader">
          {message}
      </IconText>
    );
  }
});

module.exports = PasswordResetSuccess;
