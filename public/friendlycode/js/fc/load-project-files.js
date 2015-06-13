define([], function() {
  "use strict";

  var Path = Bramble.Filer.Path;
  var FilerBuffer = Bramble.Filer.Buffer;
  var self = {};

  // Taken from http://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
  function convertToBuffer(string) {
    var buf = new ArrayBuffer(string.length);
    var bufView = new Uint8Array(buf);
    for(var i = 0, strLen = string.length; i < strLen; i++) {
      bufView[i] = string.charCodeAt(i);
    }
    return buf;
  }

  self.load = function(project, defaultTemplate, callback) {
    var fs = Bramble.getFileSystem();
    var shell = new fs.Shell();
    var projectFilesUrl = window.location.protocol + "//" + window.location.host + "/initializeProject";
    var request = new XMLHttpRequest();
    var root = project && project.title;
    var defaultProject = false;
    var files;

    if(!root) {
      callback(new Error("No project specified"));
      return;
    }

    root = Path.join("/", root);

    if(typeof defaultTemplate !== "function") {
      defaultProject = true;
      project.dateCreated = (new Date()).toISOString();
      project.dateUpdated = project.dateCreated;
      files = self.generateDefaultFiles(defaultTemplate);
      updateFs();
      return;
    }

    callback = defaultTemplate;

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

            completed++;
            checkProjectLoaded();
          });
        }

        fs.stat(parent, function(err) {
          if(!err || err.code !== "ENOENT") {
            write();
            return;
          }

          shell.mkdirp(parent, write);
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
          filePathToOpen = file.path;
        }
        file.path = Path.join(root, file.path);
        writeFile(file.path, new FilerBuffer(file.buffer));
      });
    }

    request.onreadystatechange = updateFs;
    request.responseType = "json";
    request.open("GET", projectFilesUrl, true);
    request.send();
  };

  self.generateDefaultProject = function() {
    return {
      title: "New Project",
      tags: [],
      description: ""
    };
  };

  self.generateDefaultFiles = function(defaultTemplate) {
    return [
      {
        path: "index.html",
        buffer: convertToBuffer(defaultTemplate || "")
      }
    ];
  };

  return self;
});
