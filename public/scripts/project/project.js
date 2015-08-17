define(function(require) {
  var Constants = require("constants");
  var Remote = require("../../project/remote");
  var Metadata = require("../../project/metadata");
  var Path = Bramble.Filer.Path;

  var _host;
  var _publishUrl;

  var _user;
  var _id;
  var _title;
  var _fs;
  var _anonymousId;
  var _remixId;
  var _description;

  function getAnonymousId() {
    return _anonymousId;
  }

  function getDescription() {
    return _description;
  }

  function setDescription(newDescription) {
    _description = newDescription;
  }

  function getTitle() {
    return _title;
  }

  function setTitle(title, callback) {
    Metadata.setTitle(getRoot(), title, function(err) {
      if (err) {
        return callback(err);
      }

      _title = title;
      callback();
    });
  }

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
      return Path.join(Constants.ANONYMOUS_USER_FOLDER, _anonymousId.toString());
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

  function init(projectDetails, host, callback) {
    _user = projectDetails.userID;
    _id = projectDetails.id;
    _anonymousId = projectDetails.anonymousId;
    _remixId = projectDetails.remixId;
    _host = host;
    _publishUrl = projectDetails.publishUrl;
    _fs = Bramble.getFileSystem();
    _description = projectDetails.description;

    // We have to check if we can access the 'title' stored
    // on an xattr first to know which value
    Metadata.getTitle(getRoot(), function(err, title) {
      if (err) {
        if (err.code !== "ENOENT") {
          return callback(err);
        } else if (!_user && err.code === "ENOENT") {
          _title = projectDetails.title;
          return Metadata.setTitle(getRoot(), _title, callback);
        }
      }

      if (_user) {
        // Always trust the server instead of what was
        // stored on the xattr since a user might have changed it
        // in another browser
        _title = projectDetails.title;
      } else if (title) {
        // Prefer the stored title in the anonymous case in case the
        // anonymous user changed it
        _title = title;
      } else {
        _title = projectDetails.title;
      }

      Metadata.setTitle(getRoot(), _title, callback);
    });
  }

  // Set all necesary data for this project, based on makeDetails rendered into page.
  function load(fsync, callback) {
    // Step 1: download the project's content (files + metadata) and install into the root
    Remote.loadProject({
      root: getRoot(),
      host: _host,
      user: _user,
      remixId: _remixId,
      anonymousId: _anonymousId,
      fsync: fsync
    }, function(err) {
      if(err) {
        return callback(err);
      }

      // Step 2: download the project's metadata (project + file IDs on publish) and
      // install into an xattrib on the project root.
      Metadata.load({
        root: getRoot(),
        host: _host,
        user: _user,
        remixId: _remixId,
        id: _id,
        title: _title
      }, function(err) {
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
    init: init,
    load: load,

    getRoot: getRoot,
    getUser: getUser,
    getID: getID,
    getHost: getHost,
    getPublishUrl: getPublishUrl,
    getFileID: getFileID,
    setFileID: setFileID,
    getTitle: getTitle,
    setTitle: setTitle,
    getDescription: getDescription,
    setDescription: setDescription,
    getAnonymousId: getAnonymousId,

    stripRoot: stripRoot,
    addRoot: addRoot,
    removeFile: removeFile
  };
});
