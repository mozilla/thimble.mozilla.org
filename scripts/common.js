"use strict";

let fs = require("q-io/fs");
let path = require("path");

module.exports = {
  getListLocales(src) {
    return new Promise((resolve, reject) => {
      fs.listDirectoryTree(src)
      .then(dirTree => {
        return resolve(dirTree.reduce((list, locale) => {
          locale = path.relative(src, locale);

          if (locale) {
            list.push(locale);
          }

          return list;
        }, []));
      }).catch(reject);
    });
  }
};
