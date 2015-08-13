define(function(require) {
  var Remote = require("../../project/remote");
  var Metadata = require("../../project/metadata");
  var Path = Bramble.Filer.Path;

  var _host;
  var _publishUrl;

  var _user;
  var _id;
  var _title;
  var _fs;

  // _description?

  function getUser() {
    return _user;
  }

  function getID() {
    return _id;
  }

  function getHost() {
    return _host;
  }

  function getPublishUrl() {
    return _publishUrl;
  }

  function getRoot() {
    if(!_user) {
      return Path.join("/", _title);
    }

    return Path.join("/", _user.toString(), "projects", _id.toString());
  }

  // From /7/projects/5/index.html to /index.html
  function stripRoot(path) {
    return path.replace(getRoot(), "");
  }

  // From /index.html to /7/projects/5/index.html to
  function addRoot(path) {
    Path.join(getRoot(), path);
  }

  // Look up the publish.webmaker.org file id for this path
  function getFileID(path, callback) {
    Metadata.getFileID(getRoot(), stripRoot(path), callback);
  }

  // Update the files metadata for the project to use the given id for this path
  function setFileID(path, id, callback) {
    Metadata.setFileID(getRoot(), stripRoot(path), id, callback);
  }

  // Update the files metadata for the project to use the given id for this path
  function removeFile(path, callback) {
    Metadata.removeFile(getRoot(), stripRoot(path), callback);
  }

  // Set all necesary data for this project, based on makeDetails rendered into page.
  function load(projectDetails, host, authenticated, callback) {
    _user = projectDetails.userID;
    _id = projectDetails.id;
    _title = projectDetails.title;
    _host = host;
    _publishUrl = projectDetails.publishUrl;
    _fs = Bramble.getFileSystem();

    // Step 1: download the project's content (files + metadata) and install into the root
    Remote.loadProject(getRoot(), _host, function(err) {
      if(err) {
        return callback(err);
      }

      // Step 2: download the project's metadata (project + file IDs on publsih) and
      // install into an xattrib on the project root.
      Metadata.loadMetadata(getRoot(), host, function(err) {
        if(err) {
          return callback(err);
        }

        // Find an HTML file to open in the project, hopefully /index.html
        var sh = new _fs.Shell();
        sh.find(getRoot(), {name: "*.html"}, function(err, found) {
          if(err) {
            return callback(err);
          }

          // Look for an HTML file to open, ideally index.html
          var indexPos = 0;
          found.forEach(function(path, idx) {
            if(Path.basename(path) === "index.html") {
              indexPos = idx;
            }
          });

          callback(null, found[indexPos]);
        });
      });
    });
  }

  return {
    load: load,
    getRoot: getRoot,
    getUser: getUser,
    getID: getID,
    getHost: getHost,
    getPublishUrl: getPublishUrl,
    stripRoot: stripRoot,
    addRoot: addRoot,
    getFileID: getFileID,
    setFileID: setFileID,
    removeFile: removeFile
  };
});
