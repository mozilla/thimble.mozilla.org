define(function(require) {

  var PROJECT_META_KEY = "thimble-project-meta";
  var Path = Bramble.Filer.Path;

  var _user;
  var _id;
  var _title;
  var _fs;

  function getRoot() {
    if(!_user) {
      return Path.join("/", _projectTitle);
    }

    return Path.join("/", _user, "projects", _id);
  };

  // From /7/projects/5/index.html to /index.html
  function stripRoot(path) {
    return path.replace(this.getRoot(), "");
  }
  
  // From /index.html to /7/projects/5/index.html to
  function addRoot(path) {
    Path.join(getRoot(), path);
  }

  function setMetadata(data, callback) {
    // Data is in the following form, simplify it and make it easier
    // to get file id using a path:
    // [{ id: 1, path: "/index.html", project_id: 3 }, ... ]
    var project = { id: data[0].project_id };
    project.paths = data.map(function(info) {
      project.paths[info.path] = info.id;
    });

    _fs.setxattr(getRoot(), PROJECT_META_KEY, project, callback);    
  }

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

  function init(options) {
    _user = options.userID;
    _id = options.id;
    _title = options.title;
    _fs = Bramble.getFileSystem();
  }

  return {
    init: init,
    getRoot: getRoot,
    stripRoot: stripRoot,
    addRoot: addRoot,
    getFileID: getFileID,
    setFileID: setFileID
  };
});
