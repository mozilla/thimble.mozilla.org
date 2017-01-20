var React = require('react');

var fourOhFour = React.createClass({
  componentDidMount: function() {
    document.title = "Webmaker Login: Page Not Found";
  },
  render: function() {
    return (
      <div>Page not found</div>
    );
  }
});

module.exports = fourOhFour;
