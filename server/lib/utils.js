"use strict";

let http = require("http");
let glob = require("glob");
let path = require("path");

let Utils = {
  // top level error handler for our app
  error(code, msg) {
    let err = new Error(msg || http.STATUS_CODES[code]);
    err.status = code;
    return err;
  },
  getFileList(root, pattern) {
    return glob.sync(pattern, {
      cwd: root,
      matchBase: true,
      nodir: true
    }).map(file => path.join(root, file));
  }
};

module.exports = Utils;
