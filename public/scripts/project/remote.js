define(function(require) {
  var $ = require("jquery");

  var Path = Bramble.Filer.Path;
  var Buffer = Bramble.Filer.Buffer;

  function addCacheBusting(url) {
    return url + "?cacheBust=" + (new Date()).toISOString();
  }

  // Installs a tarball (arraybuffer) containing the project's files/folders.
  function installTarball(fs, root, tarball, callback) {
    var untarWorker;
    var pending = null;
    var sh = new fs.Shell();

    function extract(path, data, callback) {
      path = Path.join(root, path);
      var basedir = Path.dirname(path);

      sh.mkdirp(basedir, function(err) {
        if(err && err.code !== "EEXIST") {
          return callback(err);
        }

        fs.writeFile(path, new Buffer(data), {encoding: null}, callback);
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

  function loadTarball(fs, root, host, callback) {
    // jQuery doesn't seem to support getting the arraybuffer type
    var url = host + "/getFileContents";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", addCacheBusting(url), true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
      if(this.status !== 200) {
        return callback(new Error("[Thimble error] unable to get tarball, status was:", this.status));
      }

      installTarball(fs, root, this.response, callback);
    };
    xhr.send();
  }

  // Places project metadata (project id, file paths + publish ids) as an
  // extended attribute on on the project root folder.
  function setMetadata(fs, root, key, data, callback) {
    // Data is in the following form, simplify it and make it easier
    // to get file id using a path:
    // [{ id: 1, path: "/index.html", project_id: 3 }, ... ]
    var project = {
      id: data[0].project_id,
      paths: {}
    };

    data.forEach(function(info) {
      project.paths[info.path] = info.id;
    });

    fs.setxattr(root, key, project, callback);    
  }

  function loadMetadata(fs, root, host, key, callback) {
    var url = host + "/getFileMeta";
    var request = $.ajax({
      type: "GET",
      headers: {
        "Accept": "application/json"
      },
      url: addCacheBusting(url)
    });
    request.done(function(data) {
      setMetadata(fs, root, key, data, callback);
    });
    request.fail(function(jqXHR, status, err) {
      callback(err);
    });
  }

  function loadProject(fs, root, host, key, callback) {
    // Step 1: download the project's content (tarball of files+folders) and
    // install into the project root dir.
    loadTarball(fs, root, host, function(err) {
      if(err) {
        return callback(err);
      }

      // Step 2: download the project's metadata (project + file IDs on publsih) and 
      // install into an xattrib on the project root.
      loadMetadata(fs, root, host, key, function(err) {
        if(err) {
          return callback(err);
        }

        // Find an HTML file to open in the project, hopefully /index.html
        var sh = new fs.Shell();
        sh.find(root, {name: "*.html"}, function(err, found) {
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
    loadProject: loadProject
  };
});
