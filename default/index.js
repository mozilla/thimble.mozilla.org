/*
 * Provide all default projects which are contained in the
 * `/default` directory. Each project must be within it's own
 * directory. An object of project directory names (key) to
 * content arrays (value) is returned. Each content array
 * contains file objects containing an absolute path (not including
 * the project name) and buffer/stream.
 * For example, for a singular project named "my-project" with the
 * following directory structure:
 * my-project
 *     ---file1
 *     ---dir1
 *         ---dir2
 *             ---file2
 * The object returned will be:
 * {
 *    my-project: [{
 *                   path: /file1,
 *                   buffer/stream: <file1 contents/stream>
 *                }, {
 *                   path: /dir1/dir2/file2,
 *                   buffer/stream: <file2 contents/stream>
 *                }]
 * }
 *
 */

var fs = require("fs");
var Path = require("path");

function readDirectory(dirName, stream) {
  var contents = fs.readdirSync(dirName);
  var files = [];

  contents.forEach(function(nodeName) {
    var nodePath = Path.join(dirName, nodeName);
    var stats = fs.statSync(nodePath);
    var file = { path: Path.join("/", nodeName) };

    if(stats.isFile()) {
      if(stream) {
        file.stream = fs.createReadStream(nodePath);
        file.size = stats.size;
      } else {
        file.buffer = fs.readFileSync(nodePath);
      }

      files.push(file);
      return;
    }

    var nodeContents = readDirectory(nodePath, stream);
    nodeContents.forEach(function(file) {
      file.path = Path.join("/", nodeName, file.path);
      files.push(file);
    });
  });

  return files;
}

// If stream is true, a stream is provided instead of a buffer for
// each file object along with the corresponding size
function getDefaultProjects(stream) {
  var DefaultProjects = {};
  var projects = fs.readdirSync(__dirname);
  projects.splice(projects.indexOf("index.js"), 1);

  projects.forEach(function(projectName) {
    DefaultProjects[projectName] = readDirectory(Path.join(__dirname, projectName), stream);
  });

  return DefaultProjects;
}

module.exports = getDefaultProjects;
