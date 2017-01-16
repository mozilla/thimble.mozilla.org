var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var Link = Router.Link;
var NotFoundRoute = Router.NotFoundRoute;
var ga = require('react-ga');
var Optimizely = require('../components/optimizely.jsx');

var gaTrackingID = process.env.GA_TRACKING_ID || 'UA-49796218-21';
var gaDebug = process.env.GA_DEBUG || 'off';

var routes = (
  <Route>
    <Route name="reset-password" path="/reset-password/?" handler={require('../pages/reset-password.jsx')}/>
    <Route name="login"          path="/login/?"          handler={require('../pages/login.jsx')}/>
    <Route name="signup"         path="/signup/?"         handler={require('../pages/signup.jsx')}/>
    <Route name="migrate"        path="/migrate/?"        handler={require('../pages/migrate.jsx')}/>
    <NotFoundRoute handler={require('../pages/404.jsx')}/>
  </Route>
);

module.exports = {
  routes: routes,
  run: function(location, el) {
    var options = {};
    if (gaDebug === 'on') {
      options.debug = true;
    }
    ga.initialize(gaTrackingID, options);
    Optimizely.initialize();
    Router.run(routes, location, function(Handler, state) {
      ga.pageview(state.pathname);
      React.render(<Handler/>, el);
    });
  }
};
