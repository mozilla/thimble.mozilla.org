"use strict";

const glob = require("glob");
const path = require("path");

class Utils {
  static getFileList(root, pattern) {
    return glob.sync(pattern, {
      cwd: root,
      matchBase: true,
      nodir: true
    }).map(file => path.join(root, file));
  }
}

module.exports = Utils;
