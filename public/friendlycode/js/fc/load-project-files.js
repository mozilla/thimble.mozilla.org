define(["jquery", "constants"], function($, Constants) {
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

  function load(project, options, callback) {
    var fs = Bramble.getFileSystem();
    var shell = new fs.Shell();
    var projectFilesUrl = "//" + window.location.host + "/initializeProject";
    var request;
    var projectTitle = project && project.title;
    var defaultProject = false;
    var defaultPath;
    var files;

    if(!projectTitle) {
      callback(new Error("[Bramble] No project specified"));
      return;
    }

    var root = Path.join("/", projectTitle);

    if(typeof options !== "function") {
      defaultProject = true;
      // `options.isNew` indicates that a new project was created for a
      // signed-in user. For the anonymous user case, for now, we default to
      // `/New Project` as the project root
      defaultPath = options.isNew ? root : Path.join("/", Constants.ANON_PROJECT_NAME);
      project.dateCreated = project.dateCreated || (new Date()).toISOString();
      project.dateUpdated = project.dateCreated;
      files = generateDefaultFiles(options.defaultTemplate, defaultPath);
      updateFs();
      return;
    }

    callback = options;

    // TODO: Remove this once https://github.com/filerjs/filer/issues/357 has
    // been fixed
    function relative(path) {
      if(!Path.isAbsolute(path)) {
        return path;
      }

      var temp = path;
      var relPath = "";
      var exit = false;

      while(!exit) {
        if(temp === root) {
          exit = true;
        } else {
          relPath = "/" + Path.basename(temp) + relPath;
        }

        temp = Path.dirname(temp);
      }

      return relPath.substr(1);
    }

    function updateFs(project) {
      if(!defaultProject && request.status !== 200) {
        callback(new Error("[Bramble] Failed to get files for this project"));
        return;
      }

      if(!files) {
        files = project.files;
      }

      var length = files.length;
      var completed = 0;
      var filePathToOpen;

      function persistFile(path, data, next) {
        var request = $.ajax({
          contentType: "application/json",
          headers: {
            "X-Csrf-Token": options.csrfToken
          },
          type: "PUT",
          url: options.persistenceURL,
          data: JSON.stringify({
            path: path,
            buffer: data
          })
        });
        request.done(function() {
          if(request.status !== 201 && request.status !== 200) {
            console.error("[Bramble] Server did not persist file");
            return callback(new Error("[Bramble] Could not persist file"));
          }

          next();
        });
        request.fail(function(jqXHR, status, err) {
          console.error("[Bramble] Failed to send request to persist the file to the server with: ", err);
          callback(err);
        });
      }

      function checkProjectLoaded() {
        if(completed === length) {
          callback(null, {
            root: root,
            open: filePathToOpen
          });
        }
      }

      function writeFile(path, data) {
        var parent = Path.dirname(path);

        function write() {
          fs.writeFile(path, data, function(err) {
            if(err) {
              console.error("[Bramble] Failed to write: ", path);
              callback(err);
              return;
            }

            if(!options.isNew) {
              completed++;
              checkProjectLoaded();
              return;
            }

            persistFile(path, data, function() {
              completed++;
              checkProjectLoaded();
            });
          });
        }

        shell.mkdirp(parent, function(err) {
          if(err && err.code !== "EEXIST") {
            console.error("[Bramble] Failed to create project directory: ", parent);
            callback(err);
            return;
          }

          write();
        });
      }

      if(!length) {
        // TODO: https://github.com/mozilla/thimble.webmaker.org/issues/602
        callback(new Error("[Bramble] No files to load"));
        return;
      }

      files.forEach(function(file) {
        // TODO: https://github.com/mozilla/thimble.webmaker.org/issues/603
        if(!filePathToOpen || Path.extname(filePathToOpen) !== ".html") {
          filePathToOpen = relative(file.path);
        }

        writeFile(file.path, new FilerBuffer(file.buffer));
      });
    }

    request = $.ajax({
      type: "GET",
      headers: {
        "Accept": "application/json"
      },
      url: projectFilesUrl
    });
    request.done(updateFs);
    request.fail(function(jqXHR, status, err) {
      callback(err);
    });
  }

  function generateDefaultProject(title) {
    return {
      title: title || Constants.ANON_PROJECT_NAME,
      tags: [],
      description: ""
    };
  }

  function generateDefaultFiles(defaultTemplate, projectPath) {
    return [{
      path: Path.join(projectPath, Constants.DEFAULT_FILE_NAME),
      buffer: convertToArrayBuffer(defaultTemplate)
    }];
  }

  return {
    load: load,
    generateDefaultProject: generateDefaultProject,
    generateDefaultFiles: generateDefaultFiles
  };
});
