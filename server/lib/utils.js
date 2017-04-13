"use strict";

let glob = require("glob");
let path = require("path");

class Utils {
  static getFileList(root, pattern) {
    try {
      return glob.sync(pattern, {
        cwd: root,
        matchBase: true,
        nodir: true
      }).map(file => path.join(root, file));
    }
    catch (err) {
      console.log("Error in utils.js: " + err);
    }
  }
}

module.exports = Utils;
