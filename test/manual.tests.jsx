var React = require('react');
var RouterViewports = require('react-router-viewports');
var routes = require('../templates/lib/routes.jsx').routes;

React.render((<div className="container-flex">
  <h1>Manual tests</h1>
  <p>Please verify that all these screens look good!</p>
  <RouterViewports routes={routes} gutter={30} />
</div>),
document.body);
