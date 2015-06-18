define([], function() {
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

  function load(project, defaultTemplate, callback) {
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
      files = generateDefaultFiles(defaultTemplate);
      updateFs();
      return;
    }

    callback = defaultTemplate;

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

  function generateDefaultProject() {
    return {
      title: "New Project",
      tags: [],
      description: ""
    };
  }

  function generateDefaultFiles(defaultTemplate) {
    return [
      {
        path: "/New Project/index.html",
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
