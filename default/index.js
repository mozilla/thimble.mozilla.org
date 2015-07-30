/*
 * Provides access to an array of files belonging to a default project.
 * Each default must have its own directory in this folder, and can
 * be accessed using the exposed `.getAsStreams(title)` and `.getAsBuffers(title)`
 * methods.
 *
 * For example, for a singular project named "my-project" with the
 * following directory structure:
 * my-project
 *     ---file1
 *     ---dir1
 *         ---dir2
 *             ---file2
 *
 * Calling defaultProjects.getAsStreams('my-project') will return:
 *  [{
 *     path: /file1,
 *     size: 12345
 *     stream: <file1 stream>
 *  }, {
 *     path: /dir1/dir2/file2,
 *     size: 12345
 *     stream: <file2 stream>
 *  }]
 *
 * Calling defaultProjects.getAsBuffers('my-project') will return:
 *  [{
 *     path: /file1,
 *     buffer: <file1 buffer>
 *  }, {
 *     path: /dir1/dir2/file2,
 *     buffer: <file2 buffer>
 *  }]
 *
 */

var fs = require("fs");
var Path = require("path");
var MemoryStream = require("memorystream");

var defaultProjects = {};

function doSyncOp(op) {
  var ret;

  try {
    ret = op();
  } catch (e) {
    console.error("Failed to cache default project files: ", e);
  }

  return ret;
}

function getDefaultProject(title, stream) {
  return defaultProjects[title].map(function(file) {
    var processed = {
      path: file.path
    };

    if (stream) {
      processed.stream = MemoryStream.createReadStream(file.buffer);
      processed.size = file.buffer.length;
    } else {
      processed.buffer = file.buffer;
    }

    return processed;
  });
}

function readDirectory(dirName) {
  var contents = doSyncOp(fs.readdirSync.bind(fs, dirName));
  var files = [];

  contents.forEach(function(nodeName) {
    var nodePath = Path.join(dirName, nodeName);
    var file = { path: Path.join("/", nodeName) };
    var stats = doSyncOp(fs.statSync.bind(fs, nodePath));

    if(stats.isFile()) {
      file.buffer = doSyncOp(fs.readFileSync.bind(fs, nodePath));

      files.push(file);
      return;
    }

    var nodeContents = readDirectory(nodePath);
    nodeContents.forEach(function(file) {
      file.path = Path.join("/", nodeName, file.path);
      files.push(file);
    });
  });

  return files;
}

function cacheProjectFiles() {
  // The folder containing this index.js file also contains
  // the default content, each in its own folder. We get a directory
  // listing and remove this index.js file, leaving only the default
  // content folders to iterate through.
  var projects = doSyncOp(fs.readdirSync.bind(fs, __dirname));
  projects.splice(projects.indexOf("index.js"), 1);

  projects.forEach(function(projectName) {
    defaultProjects[projectName] = readDirectory(Path.join(__dirname, projectName));
  });
}

cacheProjectFiles();

module.exports = {
  getAsStreams: function getAsStreams(title) {
    return getDefaultProject(title, true);
  },
  getAsBuffers: function getAsBuffers(title) {
    return getDefaultProject(title);
  }
};
