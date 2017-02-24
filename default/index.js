/*
 * Provides access to an array of files belonging to a default project.
 * Each default must have its own directory in this folder, and can
 * be accessed using the exposed `.getAsStreams(title)`, `.getAsBuffers(title)`
 * , `getPaths(title)`, and `.getAsTar(title)` methods.
 *
 * For example, for a singular project named "my-project" with the
 * following directory structure:
 * my-project
 *     ---file1
 *     ---dir1
 *         ---dir2
 *             ---file2
 *
 * Calling `defaultProjects.getAsStreams('my-project')` will return:
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
 * Calling `defaultProjects.getAsBuffers('my-project')` will return:
 *  [{
 *     path: /file1,
 *     buffer: <file1 buffer>
 *  }, {
 *     path: /dir1/dir2/file2,
 *     buffer: <file2 buffer>
 *  }]
 *
 * Calling `defaultProjects.getAsTar('my-project')` will return a single
 * tar stream containing all the files with each entry name corresponding to
 * each path as can be seen above
 *
 * Calling `defaultProjects.getPaths('my-project')` will return:
 *  [{
 *     path: "/file1"
 *  }, {
 *     path: "/dir1/dir2/file2"
 *  }]
 */

var fs = require("fs");
var Path = require("path");
var MemoryStream = require("memorystream");
var Tar = require("tar-stream");

var BUFFER = "BUFFER";
var FILE_STREAM = "FILE STREAM";
var TAR_STREAM = "TAR STREAM";

var _defaultProjects = {};
var _defaultProjectPaths = {};

function doSyncOp(op) {
  var ret;

  try {
    ret = op();
  } catch (e) {
    console.error("Failed to cache default project files: ", e);
  }

  return ret;
}

function getDefaultProject(title, dataType) {
  var result = dataType === TAR_STREAM ? Tar.pack() : [];

  _defaultProjects[title].forEach(function(file) {
    switch(dataType) {
    case TAR_STREAM:
      result.entry({ name: file.path }, file.buffer);
      break;
    case FILE_STREAM:
      result.push({
        path: file.path,
        stream: MemoryStream.createReadStream(file.buffer),
        size: file.buffer.length
      });
      break;
    case BUFFER:
    default:
      result.push(file);
      break;
    }
  });

  if(TAR_STREAM === dataType) {
    result.finalize();
  }

  return result;
}

function readDirectory(dirName) {
  var contents = doSyncOp(fs.readdirSync.bind(fs, dirName));
  var files = [];
  var filePaths = [];

  contents.forEach(function(nodeName) {
    var nodePath = Path.join(dirName, nodeName);
    var file = { path: Path.join("/", nodeName) };
    var stats = doSyncOp(fs.statSync.bind(fs, nodePath));

    if(stats.isFile()) {
      file.buffer = doSyncOp(fs.readFileSync.bind(fs, nodePath));
      filePaths.push(file.path);
      files.push(file);
      return;
    }

    var nodeContents = readDirectory(nodePath);
    nodeContents.forEach(function(file) {
      file.path = Path.join("/", nodeName, file.path);
      filePaths.push(file.path);
      files.push(file);
    });
  });

  return {
    contents: files,
    paths: filePaths
  };
}

function cacheProjectFiles() {
  // The folder containing this index.js file also contains the default 
  // content, each in its own folder.
  var projects = doSyncOp(fs.readdirSync.bind(fs, __dirname));

  projects.forEach(function(projectName) {
    var projectDir = Path.join(__dirname, projectName);

    // Cache the folders, exluding this index.js and other miscellaneous files
    if (fs.statSync(projectDir).isDirectory()) {
      var project = readDirectory(projectDir);
      _defaultProjectPaths[projectName] = project.paths;
      _defaultProjects[projectName] = project.contents;
    }
  });
}

cacheProjectFiles();

module.exports = {
  getAsStreams: function getAsStreams(title) {
    return getDefaultProject(title, FILE_STREAM);
  },
  getAsBuffers: function getAsBuffers(title) {
    return getDefaultProject(title, BUFFER);
  },
  getAsTar: function getAsTar(title) {
    return getDefaultProject(title, TAR_STREAM);
  },
  getPaths: function(title) {
    return _defaultProjectPaths[title];
  }
};
