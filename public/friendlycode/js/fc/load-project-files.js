define(["jquery"], function($) {
  "use strict";

  var Path = Bramble.Filer.Path;
  var FilerBuffer = Bramble.Filer.Buffer;

  // Taken from http://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
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
    var projectFilesUrl = window.location.protocol + "//" + window.location.host + "/initializeProject";
    var request = new XMLHttpRequest();
    var root = project && project.title;
    var defaultProject = false;
    var defaultPath;
    var files;

    if(!root) {
      callback(new Error("No project specified"));
      return;
    }

    root = Path.join("/", root);

    if(typeof options !== "function") {
      defaultProject = true;
      defaultPath = options.isNew ? "/" + project.title : "/New Project";
      project.dateCreated = project.dateCreated || (new Date()).toISOString();
      project.dateUpdated = project.dateCreated;
      files = generateDefaultFiles(options.defaultTemplate, defaultPath);
      updateFs();
      return;
    }

    callback = options;

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

    function updateFs() {
      if(!defaultProject && request.readyState !== 4) {
        return;
      }

      if(!defaultProject && request.status !== 200) {
        // TODO: handle error case here
        callback(new Error("Failed to get files for this project"));
        return;
      }

      if(!files) {
        try {
          files = request.response.files;
        } catch(e) {
          // TODO: handle error case here
          callback(new Error("Failed to get a response"));
          return;
        }
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
          if(request.readyState !== 4) {
            return;
          }

          if(request.status !== 201 && request.status !== 200) {
            // TODO: handle error case here
            console.error("Server did not persist file");
            return callback(new Error("Could not persist file"));
          }

          console.log("Successfully persisted ", path);
          next();
        });
        request.fail(function(jqXHR, status, err) {
          console.error("Failed to send request to persist the file to the server with: ", err);
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
              // TODO: handle error case here
              console.error("Failed to write: ", path);
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
            console.error("Failed to create project directory: ", parent);
            callback(err);
            return;
          }

          write();
        });
      }

      if(!length) {
        // TODO: What should we do here? :P
        callback(new Error("No files to load"));
        return;
      }

      files.forEach(function(file) {
        // TODO: Make this configurable
        if(!filePathToOpen || Path.extname(filePathToOpen) !== ".html") {
          filePathToOpen = relative(file.path);
        }

        writeFile(file.path, new FilerBuffer(file.buffer));
      });
    }

    request.onreadystatechange = updateFs;
    request.responseType = "json";
    request.open("GET", projectFilesUrl, true);
    request.send();
  }

  function generateDefaultProject(title) {
    return {
      title: title || "New Project",
      tags: [],
      description: ""
    };
  }

  function generateDefaultFiles(defaultTemplate, projectPath) {
    return [
      {
        path: Path.join(projectPath, "index.html"),
        buffer: convertToArrayBuffer(defaultTemplate)
      }
    ];
  }

  return {
    load: load,
    generateDefaultProject: generateDefaultProject,
    generateDefaultFiles: generateDefaultFiles
  };
});
