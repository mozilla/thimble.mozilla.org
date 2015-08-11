define(function(require) {
  var $ = require("jquery");

  var PROJECT_META_KEY = "thimble-project-meta";
  var Path = Bramble.Filer.Path;
  var Buffer = Bramble.Filer.Buffer;

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
      return Path.join("/", _projectTitle);
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

  // Installs a tarball (arraybuffer) containing the project's files/folders.
  function installTarball(tarball, callback) {
    var untarWorker;
    var pending = null;
    var root = getRoot();
    var sh = new _fs.Shell();

    function extract(path, data, callback) {
      path = Path.resolve(root, path);
      var basedir = Path.dirname(path);

      sh.mkdirp(basedir, function(err) {
        if(err && err.code !== "EEXIST") {
          return callback(err);
        }

        _fs.writeFile(path, new Buffer(data), {encoding: null}, callback);
      });
    }

    function finish(err) {
      untarWorker.terminate();
      untarWorker = null;

      callback(err);
    }

    function writeCallback(err) {
      if(err) {
        console.error("[Thimble error] couldn't extract file for tar", err);
      }

      pending--;
      if(pending === 0) {
        finish(err);
      }
    }

    untarWorker = new Worker("/scripts/editor/vendor/bitjs-untar-worker.min.js");
    untarWorker.addEventListener("message", function(e) {
      var data = e.data;

      if(data.type === "progress" && pending === null) {
        // Set the total number of files we need to deal with so we know when we're done
        pending = data.totalFilesInArchive;
      } else if(data.type === "extract") {
        extract(data.unarchivedFile.filename, data.unarchivedFile.fileData, writeCallback);
      } else if(data.type === "error") {
        finish(new Error("[Thimble error]: " + data.msg));
      }
    });

    untarWorker.postMessage({file: tarball});
  }

  // Places project metadata (project id, file paths + publish ids) as an
  // extended attribute on on the project root folder.
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

  function loadTarball(callback) {
    // jQuery doesn't seem to support getting the arraybuffer type
    var url = _host + "/getFileContents";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
      if(this.status !== 200) {
        return callback(new Error("[Thimble error] unable to get tarball, status was:", this.status));
      }

      installTarball(this.response, callback);
    };
    xhr.send();
  }

  function loadMetadata(callback) {
    var url = _host + "/getFileMeta";
    var request = $.ajax({
      type: "GET",
      headers: {
        "Accept": "application/json"
      },
      url: url + '?cacheBust=' + (new Date()).toISOString()
    });
    request.done(function(data) {
      setMetadata(data, callback);
    });
    request.fail(function(jqXHR, status, err) {
      callback(err);
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
    loadTarball(function(err) {
      if(err) {
        return callback(err);
      }

      loadMetadata(function(err) {
        if(err) {
          return callback(err);
        }

        /** What to do about picking the file to open???
            files.forEach(function(file) {
              // TODO: https://github.com/mozilla/thimble.webmaker.org/issues/603
              if(!filePathToOpen || Path.extname(filePathToOpen) !== ".html") {
                filePathToOpen = Path.relative(config.root, file.path);
              }
        ***/

        callback(null, {
          root: getRoot(),
          open: "index.html" // TODO: need to deal with logic around filePathToOpen
        });
    });
  }

  return {
    load: load,
    getRoot: getRoot,
    getUser: getUser,
    getID: getID,
    getHost: getHost,
    stripRoot: stripRoot,
    addRoot: addRoot,
    getFileID: getFileID,
    setFileID: setFileID
  };
});
