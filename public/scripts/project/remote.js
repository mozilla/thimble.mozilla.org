define(function() {
  var Path = Bramble.Filer.Path;
  var Buffer = Bramble.Filer.Buffer;
  var fs = Bramble.getFileSystem();

  // Installs a tarball (arraybuffer) containing the project's files/folders.
  function installTarball(root, tarball, callback) {
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

  function loadTarball(root, host, callback) {
    // jQuery doesn't seem to support getting the arraybuffer type
    var url = host + "/getFileContents?cacheBust=" + (new Date()).toISOString();
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
      if(this.status !== 200) {
        return callback(new Error("[Thimble error] unable to get tarball, status was:", this.status));
      }

      installTarball(root, this.response, callback);
    };
    xhr.send();
  }

  function loadProject(root, host, callback) {
    loadTarball(root, host, callback);
  }    
  
  return {
    loadProject: loadProject
  };
});
