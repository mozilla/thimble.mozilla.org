/**
 * Simple console logging. To enable logging, use ?logging=1
 */

define(function() {

  function log(module, data) {
    var args = Array.prototype.slice.call(arguments);

    if(args.length === 1) {
      data = module;
      module = "Thimble LOG";
    } else {
      module = "Thimble LOG (module=" + args[0] + ")";
      args.shift();
    }

    args.unshift("[" + module + "]");
    console.log.apply(console, args);
  }

  function noop() {}

  return (function(search) {
    if(search.indexOf("logging=1") > -1) {
      return log;
    }

    console.info("[Thimble] to see detailed logging info in the console, reload with ?logging=1 on the URL.");
    return noop;
  }(window.location.search));
});
