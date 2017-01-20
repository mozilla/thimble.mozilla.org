var should = require('should');
var React = require('react/addons');
var RouterStub = require('react-router-stub');
var Header = require('./header.jsx');

var testProps = {
  redirectText: 'Already have an account?',
  redirectPage: 'login',
  redirectLabel: 'login',
  redirectQuery: {
    client_id: 'test',
    state: 'random',
    scopes: 'user',
    response_type: 'code'
  }
};


describe('header', function() {

  var instance;
  var el;

  beforeEach(function() {
    instance = RouterStub.render(Header, testProps);
    el = instance.getDOMNode();
  });

  afterEach(function () {
    RouterStub.unmount(instance);
    el = null;
  });

  it('should contain the redirectText', function () {
    should(instance.refs.text.props.children).be.equal(testProps.redirectText);
  });
  it('should create a link to the redirect page', function () {
    should(instance.refs.link.props.to).be.equal(testProps.redirectPage);
    should(el.querySelector('a')).be.ok;
  });

  it('should contain the correct query parameters', function () {
    should(instance.refs.link.props.query.client_id).be.equal(testProps.redirectQuery.client_id);
    should(instance.refs.link.props.query.state).be.equal(testProps.redirectQuery.state);
    should(instance.refs.link.props.query.scopes).be.equal(testProps.redirectQuery.scopes);
    should(instance.refs.link.props.query.response_type).be.equal(testProps.redirectQuery.response_type);
  });

});
