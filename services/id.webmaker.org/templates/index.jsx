var React = require('react');
var Router = require('react-router');
var routes = require('./lib/routes.jsx');

routes.run(Router.HistoryLocation, document.body);

