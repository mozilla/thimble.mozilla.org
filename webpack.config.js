"use strict";

const webpack = require("webpack");
const path = require("path");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const WebpackOnBuildPlugin = require("on-build-webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const autoprefixer = require("autoprefixer");
const colors = require("colors");

const env = require("./server/lib/environment");

const IS_DEVELOPMENT = env.get("NODE_ENV") === "development";

const moduleConfig = {
  rules: [{
    test: /\.js$/,
    exclude: /node_modules/,
    loader: "babel-loader"
  }, {
    test: /\.less$/,
    use: ExtractTextPlugin.extract({
      use: [{
        loader: "css-loader",
        options: {
          minimize: !IS_DEVELOPMENT
        }
      }, {
        loader: "postcss-loader",
        options: {
          plugins: [ autoprefixer() ]
        }
      }, {
        loader: "less-loader"
      }]
    })
  }]
};

const plugins = [
  new ExtractTextPlugin("stylesheets/style.css")
];

if(!IS_DEVELOPMENT) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin()
  );
} else {
  plugins.push(
    new WebpackOnBuildPlugin(stats => {
      if(stats.compilation.outputOptions.path === path.resolve(__dirname, "dist/editor")) {
        process.nextTick(() => {
          console.log(colors.cyan(`Client files have been built. You can now load Thimble at ${env.get("APP_HOSTNAME")}`));
        });
      }
    })
  )
}

plugins.push(new ProgressBarPlugin({
  clear: false
}));

function absolutePublicPath(filePath) {
  return path.resolve(__dirname, "public", filePath);
}

const HOMEPAGE_CONFIG = {
  entry: [
    "homepage/scripts/main.js",
    "homepage/stylesheets/style.less",
    "homepage/stylesheets/get-involved.less",
    "homepage/stylesheets/gallery.less",
    "homepage/stylesheets/features.less"
  ]
  .map(absolutePublicPath),

  output: {
    path: path.resolve(__dirname, "dist/homepage"),
    pathinfo: IS_DEVELOPMENT,
    filename: "scripts/main.js"
  }
};

const PROJECTS_LIST_CONFIG = {
  entry: [
    "projects-list/scripts/main.js",
    "projects-list/stylesheets/style.less"
  ]
  .map(absolutePublicPath),

  output: {
    path: path.resolve(__dirname, "dist/projects-list"),
    pathinfo: IS_DEVELOPMENT,
    filename: "scripts/main.js"
  }
};

const EDITOR_CONFIG = {
  entry: [
    "editor/scripts/main",
    "editor/stylesheets/editor.less",
    "editor/stylesheets/publish.less"
  ]
  .map(absolutePublicPath),

  output: {
    path: path.resolve(__dirname, "dist/editor"),
    pathinfo: IS_DEVELOPMENT,
    filename: "scripts/main.js"
  }
};

const RESOURCES_JS_CONFIG = {
  entry: {
    "bitjs-untar-worker.min": absolutePublicPath("resources/scripts/bitjs-untar-worker.min.js"),
    "error": absolutePublicPath("resources/scripts/error.js")
  },

  output: {
    path: path.resolve(__dirname, "dist/resources"),
    pathinfo: IS_DEVELOPMENT,
    filename: "scripts/[name].js"
  }
};

const RESOURCES_CSS_CONFIG = {
  entry: {
    "error": absolutePublicPath("resources/stylesheets/error.less"),
    "normalize": absolutePublicPath("resources/stylesheets/normalize.less"),
    "userbar": absolutePublicPath("resources/stylesheets/userbar.less")
  },

  output: {
    path: path.resolve(__dirname, "dist/resources"),
    filename: "stylesheets/[name].css"
  },

  plugins: [
    new ExtractTextPlugin("stylesheets/[name].css"),
    ...plugins.slice(1)
  ]
};

module.exports = [
  HOMEPAGE_CONFIG,
  PROJECTS_LIST_CONFIG,
  EDITOR_CONFIG,
  RESOURCES_JS_CONFIG,
  RESOURCES_CSS_CONFIG
].map(config => Object.assign({
  module: moduleConfig,
  plugins,
  externals: {
    strings: "__THIMBLE_STRINGS__"
  },
  watch: IS_DEVELOPMENT,
  stats: IS_DEVELOPMENT ? "errors-only" : "normal"
}, config));
