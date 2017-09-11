"use strict";

const webpack = require("webpack");
const path = require("path");
const WebpackOnBuildPlugin = require("on-build-webpack");

const env = require("./server/lib/environment");

const IS_DEVELOPMENT = env.get("NODE_ENV") === "development";
const plugins = [];

if(!IS_DEVELOPMENT) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin()
  );
} else {
  plugins.push(
    new WebpackOnBuildPlugin(stats => {
      if(stats.compilation.outputOptions.path === path.resolve(__dirname, "dist/editor")) {
        process.nextTick(() => {
          console.log(`Client files have been built. You can now load Thimble at ${env.get("APP_HOSTNAME")}`);
        });
      }
    })
  )
}

function absolutePublicPath(filePath) {
  return path.resolve(__dirname, "public", filePath);
}

const HOMEPAGE_CONFIG = {
  entry: [
    "homepage/scripts/main.js"
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
    "projects-list/scripts/main.js"
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
    "editor/scripts/main"
  ]
  .map(absolutePublicPath),

  output: {
    path: path.resolve(__dirname, "dist/editor"),
    pathinfo: IS_DEVELOPMENT,
    filename: "scripts/main.js"
  }
};

module.exports = [
  HOMEPAGE_CONFIG,
  PROJECTS_LIST_CONFIG,
  EDITOR_CONFIG
].map(config => Object.assign(config, {
  plugins,
  externals: {
    strings: "__THIMBLE_STRINGS__"
  },
  watch: IS_DEVELOPMENT
}));
