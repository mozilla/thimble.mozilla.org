define(function(require) {
  var $ = require("jquery");

  var Path = Bramble.Filer.Path;
  var FilerBuffer = Bramble.Filer.Buffer;

  function writeFile(config, path, data, callback) {
    var parent = Path.dirname(path);

    function write() {
      config.fs.writeFile(path, data, function(err) {
        if(err) {
          console.error("[Bramble] Failed to write: ", path);
          callback(err);
          return;
        }

        callback();
      });
    }

    config.shell.mkdirp(parent, function(err) {
      if(err && err.code !== "EEXIST") {
        console.error("[Bramble] Failed to create project directory: ", parent);
        callback(err);
        return;
      }

      write();
    });
  }

  function updateFs(config, files, callback) {
    var length;
    var completed = 0;
    var filePathToOpen;

    function endWriteFile(err) {
      if(err) {
        callback(err);
        return;
      }

      if(++completed === length) {
        callback(null, {
          root: config.root,
          open: filePathToOpen
        });
      }
    }

    length = files.length;
    if(!length) {
      // TODO: https://github.com/mozilla/thimble.webmaker.org/issues/602
      callback(new Error("[Bramble] No files to load"));
      return;
    }

    files.forEach(function(file) {
      // TODO: https://github.com/mozilla/thimble.webmaker.org/issues/603
      if(!filePathToOpen || Path.extname(filePathToOpen) !== ".html") {
        filePathToOpen = Path.relative(config.root, file.path);
      }

      writeFile(config, file.path, new FilerBuffer(file.buffer), endWriteFile);
    });
  }

  function load(project, options, callback) {
    var root = project.root;
    var authenticated = options.authenticated;
    var config = JSON.parse(JSON.stringify(options));
    config.root = root;
    config.fs = Bramble.getFileSystem();
    config.shell = new config.fs.Shell();

    if(!authenticated) {
      project.dateCreated = (new Date()).toISOString();
      project.dateUpdated = project.dateCreated;
    }

    // For loading an existing project, first we need to get the
    // files from the server and only then update the Bramble filesystem
    var request = $.ajax({
      type: "GET",
      headers: {
        "Accept": "application/json"
      },
      url: config.getFilesURL + '?cacheBust=' + (new Date()).toISOString()
    });
    request.done(function(project) {
      if(request.status !== 200) {
        callback(new Error("[Bramble] Failed to get files for this project"));
        return;
      }

      updateFs(config, project.files, callback);
    });
    request.fail(function(jqXHR, status, err) {
      callback(err);
    });
  }

  return {
    load: load
  };
});
