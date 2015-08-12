define(function(require) {
  var Remote = require("../../project/remote");
  var Path = Bramble.Filer.Path;
  var PROJECT_META_KEY = "thimble-project-meta";

  var _host;
  var _publishUrl;

  var _user;
  var _id;
  var _title;
  var _fs;

  // _dateCreated ?
  // _dateUpdated? 
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

    return Path.join("/", _user, "projects", _id);
  }

  // From /7/projects/5/index.html to /index.html
  function stripRoot(path) {
    return path.replace(this.getRoot(), "");
  }
  
  // From /index.html to /7/projects/5/index.html to
  function addRoot(path) {
    Path.join(getRoot(), path);
  }

  // Read the entire metadata record from the project root's extended attribute.
  function getMetadata(callback) {
    _fs.getxattr(getRoot(), PROJECT_META_KEY, function(err, value) {
      if(err && err.code !== 'ENOATTR') {
        return callback(err);
      }

      callback(null, value);
    });
  }

  // Look up the publish.webmaker.org file id for this path
  function getFileID(path, callback) {
    getMetadata(function(err, value) {
      if(err) {
        return callback(err);
      }

      path = stripRoot(path);
      callback(null, value.paths[path]);
    });
  }

  // Update the files metadata for the project to use the given id for this path
  function setFileID(path, id, callback) {
    getMetadata(function(err, value) {
      if(err) {
        return callback(err);
      }

      path = stripRoot(path);
      value.paths[path] = id;

      _fs.setxattr(getRoot(), PROJECT_META_KEY, value, callback);
    });
  }

  // Update the files metadata for the project to use the given id for this path
  function removeFile(path, callback) {
    getMetadata(function(err, value) {
      if(err) {
        return callback(err);
      }

      path = stripRoot(path);
      delete value.paths[path];

      _fs.setxattr(getRoot(), PROJECT_META_KEY, value, callback);
    });
  }

  // Set all necesary data for this project, based on makeDetails rendered into page.
  function load(projectDetails, host, authenticated, callback) {
    _user = projectDetails.userID;
    _id = projectDetails.id;
    _title = projectDetails.title;
    _host = host;
    _publishUrl = projectDetails.publishUrl;
    _fs = Bramble.getFileSystem();

    // TODO - what to do about these?
//    if(!options.authenticated) {
//      project.dateCreated = (new Date()).toISOString();
//      project.dateUpdated = project.dateCreated;
//    }

    // Now download the project's content (files + metadata) and install into the root
    Remote.loadProject(_fs, getRoot(), _host, PROJECT_META_KEY, callback);
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
