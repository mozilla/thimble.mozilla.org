var React = require('react');
var IconText = require('./icontext.jsx');

var KeyEmailed = React.createClass({
  render: function() {
    return (
      <IconText
        iconClass="emailSentIcon fa fa-envelope-o"
        className="emailSent centerDiv"
        header="Thanks!"
        headerClass="emailSentHeader">
          <p>We've just emailed you a link to create your password.</p>
      </IconText>
    );
  }
});

module.exports = KeyEmailed;
