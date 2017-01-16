module.exports = function (health) {
  var handlers = {};

  // FOR MOCHA TESTING:
  // If we're running as a child process, let our parent know there was a
  // problem.
  handlers.forkErrorHandling = function forkErrorHandling() {
    if (process.send) {
      try {
        process.send("sqlNoConnection");
      } catch (e) {
        // exit the worker if master is gone
        process.exit(1);
      }
    }
  };
  // FOR MOCHA TESTING:
  // If we're running as a child process, let our parent know we're ready.
  handlers.forkSuccessHandling = function forkSuccessHandling() {
    if (process.send) {
      try {
        process.send("sqlStarted");
      } catch (e) {
        // exit the worker if master is gone
        process.exit(1);
      }
    }
  };

  // Display a database error
  handlers.dbErrorHandling = function dbErrorHandling(err, callback) {
    callback = callback || function () {};

    // Error display
    err = Array.isArray(err) ? err[0] : err;
    console.error("db/index.js: DB setup error\n", err.number ? err.number : err.code, err.message);

    // Set state
    health.connected = false;
    health.err = err;

    callback();
  };

  return handlers;
};
