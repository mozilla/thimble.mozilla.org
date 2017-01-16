var React = require('react');

var ToolTip = React.createClass({
  render: function() {
    return (<span className={this.props.className}>{this.props.message}</span>);
  }
});

module.exports = ToolTip;
