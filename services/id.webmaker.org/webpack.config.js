var webpack = require('webpack');

var IMPORT_ES5_SHIM = 'imports?shim=es5-shim/es5-shim&' +
                      'sham=es5-shim/es5-sham';

function importEnvVars(keys) {
  var result = {};

  keys.forEach(function(key) {
    if (typeof (process.env[key]) === 'string') {
      result['process.env.' + key] = JSON.stringify(process.env[key]);
    }
  });

  return result;
}

module.exports = {
  entry: {
    app: './templates/index.jsx',
    tests: './test/browser.tests.jsx',
    manual: './test/manual.tests.jsx'
  },
  devtool: process.env.WEBPACK_DEVTOOL || 'source-map',
  output: {
    path: __dirname + '/public',
    filename: '[name].bundle.js'
  },
  module: {
    loaders: [
      { test: /\.jsx$/, loaders: ['babel', 'jsx-loader'] },
      // https://github.com/webpack/webpack/issues/558#issuecomment-60889168
      { test: require.resolve('react'), loader: IMPORT_ES5_SHIM },
      { test: require.resolve('react/addons'), loader: IMPORT_ES5_SHIM },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  },
  node: {
    net: 'empty',
    dns: 'empty'
  },
  plugins: [
    new webpack.DefinePlugin(importEnvVars([
      // Any variables we want to expose to the client:
      'GA_TRACKING_ID',
      'GA_DEBUG',
      'OPTIMIZELY_ID',
      'OPTIMIZELY_ACTIVE'
    ]))
  ]
};
