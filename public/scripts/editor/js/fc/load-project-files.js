define(function(require) {
  var $ = require("jquery");
  var FSSync = require("fc/filesystem-sync");
  var defaultHTML = require("text!fc/stay-calm/index.html");
  var defaultCSS = require("text!fc/stay-calm/style.css");
  var crownSVG = require("text!fc/stay-calm/crown.svg");
  var thimbleSVG = require("text!fc/stay-calm/thimble.svg");

  var Path = Bramble.Filer.Path;
  var FilerBuffer = Bramble.Filer.Buffer;

  // Taken from http://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
  // TODO: https://github.com/mozilla/thimble.webmaker.org/issues/601 OR
  // https://github.com/mozilla/publish.webmaker.org/issues/52
  function convertToArrayBuffer(string) {
    var buf = new ArrayBuffer(string.length);
    var bufView = new Uint8Array(buf);
    for(var i = 0, strLen = string.length; i < strLen; i++) {
      bufView[i] = string.charCodeAt(i);
    }
    return buf;
  }

  function persist(config, path, data, callback) {
    var formData = FSSync.toFormData(path, data, config.dateUpdated);
    var request = $.ajax({
      headers: {
        "X-Csrf-Token": config.csrfToken
      },
      type: "PUT",
      url: config.persistenceURL,
      data: formData,
      cache: false,
      contentType: false,
      processData: false
    });
    request.done(function() {
      if(request.status !== 201 && request.status !== 200) {
        console.error("[Bramble] Server did not persist file");
        callback(new Error("[Bramble] Could not persist file"));
        return;
      }

      callback();
    });
    request.fail(function(jqXHR, status, err) {
      console.error("[Bramble] Failed to send request to persist the file to the server with: ", err);
      callback(err);
    });
  }

  function writeFile(config, path, data, callback) {
    var parent = Path.dirname(path);

    function write() {
      config.fs.writeFile(path, data, function(err) {
        if(err) {
          console.error("[Bramble] Failed to write: ", path);
          callback(err);
          return;
        }

        // If this was a file created for a new project for an
        // authenticated user, we should persist it to the server
        if(config.persist) {
          persist(config, path, data, callback);
        } else {
          callback();
        }
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

    // For any scenario that creates a new project (the first
    // being in the case of an unauthenticated user and the second
    // being the case when an authenticated user creates a new
    // project), initialize the date created and updated and
    // generate default files for the project. Once that is done,
    // we can directly update the Bramble filesystem
    if(options.createTemplate) {
      project.dateCreated = (new Date()).toISOString();
      project.dateUpdated = project.dateCreated;

      // Persist the new project's files to the server for an
      // authenticated user
      if(authenticated) {
        config.persist = true;
        config.dateUpdated = project.dateUpdated;
      }

      updateFs(config, generateDefaultFiles(root), callback);
      return;
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

  // XXX: For user testing, we're going to start with the "Stay Calm" poster project
  function generateDefaultFiles(projectPath) {
    return [{
      path: Path.join(projectPath, "index.html"),
      buffer: convertToArrayBuffer(defaultHTML)
    },
    {
      path: Path.join(projectPath, "style.css"),
      buffer: convertToArrayBuffer(defaultCSS)
    },
    {
      path: Path.join(projectPath, "crown.svg"),
      buffer: convertToArrayBuffer(crownSVG)
    },
    {
      path: Path.join(projectPath, "thimble.svg"),
      buffer: convertToArrayBuffer(thimbleSVG)
    }];
  }

  return {
    load: load
  };
});
