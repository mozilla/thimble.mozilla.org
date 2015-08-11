define(function(require) {
  var $ = require("jquery");

  var Path = Bramble.Filer.Path;
  var FilerBuffer = Bramble.Filer.Buffer;

  function getTarballBuffer(url, callback) {
    // jQuery doesn't seem to support getting the arraybuffer type
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
      if(this.status !== 200) {
        return callback(new Error("[Thimble error] unable to get tarball, status was:", this.status));
      }

      callback(null, this.response);
    };
    xhr.send();
  }

  function installTarball(root, url, callback) {
    var untarWorker;
    var pending = null;
    var fs = Bramble.getFileSystem();
    var sh = new fs.Shell();

    function extract(path, data, callback) {
      path = Path.resolve(root, path);
      var basedir = Path.dirname(path);

      sh.mkdirp(basedir, function(err) {
        if(err && err.code !== "EEXIST") {
          return callback(err);
        }

        fs.writeFile(path, new FilerBuffer(data), {encoding: null}, callback);
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

    getTarballBuffer(url, function(err, buffer) {
      if(err) {
        return callback(err);
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

      untarWorker.postMessage({file: buffer});
    });
  }

  function getFileMetadata(root, url, callback) {
    var request = $.ajax({
      type: "GET",
      headers: {
        "Accept": "application/json"
      },
      url: url + '?cacheBust=' + (new Date()).toISOString()
    });
    request.done(function(data) {
      Project.setMetadata(data, callback);
    });
    request.fail(function(jqXHR, status, err) {
      callback(err);
    });
  }

  /**
   * Loading a project is a two step process. First we have to get a tarball
   * with the filesystem contents, and install that into the project root.
   * Second, we need to get project metadata, and write that into the project root's
   * extended attributes
   */
  function load(root, options, callback) {
    if(!options.authenticated) {
      project.dateCreated = (new Date()).toISOString();
      project.dateUpdated = project.dateCreated;
    }

    installTarball(root, options.getFileContentsURL, function(err) {
      if(err) {
        return callback(err);
      }

/**
    files.forEach(function(file) {
      // TODO: https://github.com/mozilla/thimble.webmaker.org/issues/603
      if(!filePathToOpen || Path.extname(filePathToOpen) !== ".html") {
        filePathToOpen = Path.relative(config.root, file.path);
      }
***/
      getFileMetadata(root, options.getFileMetaURL, function(err) {
        if(err) {
          return callback(err);
        }

        callback(null, {
          root: root,
          open: "index.html" // TODO: need to deal with logic around filePathToOpen
        });
      });
    });
  }

  return {
    load: load
  };
});
