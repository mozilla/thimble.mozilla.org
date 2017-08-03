"use strict";

const path = require("path");

const localizeClient = require("./localize-client");

localizeClient.runAll(currentPath => {
  // Ignore the homepage and projects-list dir so that we
  // can localize it separately
  // See https://github.com/kriskowal/q-io#listtreepath-guardpath-stat
  if(/^homepage$|^projects-list$/.test(path.basename(currentPath))) {
    return null;
  }

  return true;
})
.then(() => {
  // Now we localize the homepage dir
  const srcPath = path.join(process.cwd(), "dist");

  return localizeClient.localizeClientFiles(srcPath, (currentPath, stats) => {
    const relPath = path.relative(srcPath, currentPath);

    if(/^homepage|^projects-list/.test(relPath) || currentPath === srcPath) {
      return true;
    }

    return null;
  })
  .then(() => console.log("Successfully localized the client[webpack]"))
  .catch(err => console.error("Failed to generate localized client[webpack] with: ", err));
});
