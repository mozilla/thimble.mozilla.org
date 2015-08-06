define(function() {
  var Path = Bramble.Filer.Path;
  var uuid = require("uuid");
  var fs = Bramble.getFileSystem();
  var sh = fs.Shell();

  // Bramble loads all projects via symlinks stored in entries named /.mnt/<uuid>
  var MOUNT_DIR = "/.mnt";

  function createMountPoint(root, callback) {
    var mountPoint = Path.join(MOUNT_DIR, uuid.v4());

    sh.mkdirp(MOUNT_DIR, function(err) {
      if(err && err.code !== "EEXIST") {
        console.error("[Bramble Error] Failed to create mount directory:", err);
        callback(err);
        return;
      }

      fs.symlink(root, mountPoint, function(err) {
        if(err) {
          console.error("[Bramble Error] Failed to create project symlink:", err);
          callback(err);
          return;
        }

        callback(null, mountPoint);
      });
    });
  }

  // Transform paths from symlinked (/.mnt/...) to real paths
  function transformPaths(bramble, paths, options, callback) {
    if(typeof options === "function") {
      callback = options;
      options = null;
    }
    options = options || {};

    var brambleRoot = bramble.getRootDir();

    // If all the user wants is a relative path into the project root
    // just strip the brambleRoot off all the paths and return.
    if(options.projectRelative) {
      return callback(null, paths.map(function(path) {
        return path.slice(brambleRoot.length);
      }));
    }

    // Otherwise, read the symlink's realpath and use that as the prefix.
    fs.readlink(brambleRoot, function(err, realpath) {
      if(err) {
        return callback(err);
      }

      callback(null, paths.map(function(path) {
        return Path.join(realpath, Path.relative(brambleRoot, path));
      }));
    });
  }

  // Single path version for ease of use.
  function transformPath(bramble, path, options, callback) {
    if(typeof options === "function") {
      callback = options;
      options = null;
    }
    options = options || {};

    transformPaths(bramble, [path], options, function(err, paths) {
      if(err) {
        return callback(err);
      }
      callback(null, paths[0]);
    });
  }

  return {
    transformPaths: transformPaths,
    transformPath: transformPath,
    createMountPoint: createMountPoint
  };
});
