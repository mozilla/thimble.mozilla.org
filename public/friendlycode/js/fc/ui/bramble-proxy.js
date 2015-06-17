// This file is the friendlycode half of a proxy layer between Thimble functionality
// (like publishing) and bramble's codemirror instance. It was designed to map to existing
// friendlycode use of codemirror, with the exception of duplicate functionality
// between bramble and friendlycode that bramble already provides (or will)
/*global define */
define(["backbone-events", "fc/prefs", "fc/bramble-ui-bridge"],
  function(BackboneEvents, Preferences, BrambleUIBridge) {
  "use strict";

  var eventCBs = {
    "change": [],
    "reparse": [],
    "loaded": [],
    "viewlink": []
  };
  var telegraph;
  var iframe;

  function BrambleProxy(place, options) {
    var latestSource;
    var prefSize = Preferences.get("textSize");
    var that = this;
    var lastLine = 0;
    var scrollInfo;
    var _instance;

    var editorHost = this.editorHost = options.editorHost;

    function communicateEditMessage(fn) {
      var argLen = arguments.length;
      var callback = typeof arguments[argLen - 1] === "function" ? arguments[argLen - 1] : undefined;
      var params = Array.prototype.slice.call(arguments, 1, callback ? argLen - 1 : argLen);

      if(callback) {
        window.addEventListener("message", function editReceiver(e) {
          var message = JSON.parse(e.data);

          // Make sure we only take postMessages seriously
          // when they come from our editor
          if (e.origin !== editorHost) {
            return;
          }

          if(message.type !== "bramble:edit" || message.fn !== fn) {
            return;
          }

          window.removeEventListener("message", editReceiver);

          callback(message.value);
        });
      }

      telegraph.postMessage(JSON.stringify({
        type: "bramble:edit",
        fn: fn,
        params: params
      }), editorHost);
    }

    // Create CodeMirror-like interface for friendlycode to use
    this.getValue = function() {
      return latestSource;
    };

    // Stub for CodeMirror's method to get the last line in the editor
    this.lastLine = function() {
      return lastLine;
    };

    this.getScrollInfo = function() {
      return scrollInfo;
    };

    this.lineAtHeight = function(height, mode, callback) {
      communicateEditMessage("lineAtHeight", height, mode, callback);
    };

    this.setGutterMarker = function(line, gutterID, element, callback) {
      communicateEditMessage("setGutterMarker", line, gutterID, element, callback);
    };

    this.addLineClass = function(line, where, cssClass, callback) {
      communicateEditMessage("addLineClass", line, where, cssClass, callback);
    };

    this.removeLineClass = function(line, where, cssClass, callback) {
      communicateEditMessage("removeLineClass", line, where, cssClass, callback);
    };

    this.heightAtLine = function(line, mode, callback) {
      communicateEditMessage("heightAtLine", line, mode, callback);
    };

    this.getLineHeight = function(selector, callback) {
      communicateEditMessage("getLineHeight", selector, callback);
    };

    this.scrollTo = function(x, y) {
      communicateEditMessage("scrollTo", x, y);
    };

    this.init = function(make, initFs) {
      var self = this;

      // Start loading Bramble
      Bramble.load("#webmaker-bramble",{
        url: options.editorUrl
      });

      // Event listeners
      Bramble.once("ready", function(bramble) {
        // For debugging, attach to window.
        window.bramble = bramble;
        BrambleUIBridge.init(bramble);
      });

      Bramble.on("error", function(err) {
        console.log("error", err);
      });

      Bramble.on("readyStateChange", function(previous, current) {
        console.log("readyStateChange", previous, current);
      });

      initFs(function(err, config) {
        if(err) {
          throw err;
        }

        console.log(Bramble.Filer.Path.normalize(config.root));

        // Now that fs is setup, tell Bramble which root dir to mount
        // and which file within that root to open on startup.
        Bramble.mount(config.root, config.open);
      });
    };

    this.getWrapperElement = function() {
      return place;
    };
  }

  BrambleProxy.prototype.undo = function () {
    this.executeCommand("_undo");
  };
  BrambleProxy.prototype.redo = function () {
    this.executeCommand("_redo");
  };

  /* This function handles all the button presses thimble has,
   * It takes in 2 parameters, a string representing the command, and an object called options
   * It packages a JSON object and sends it over post to thimble proxy inside brackets
   * categoryCommand refers to what type of command should be fired inside brackets, these types being:
   *    menuCommand: Menu Command, refers to any command outlined in the menu
   *    fontChange: font Change, refers to a method in which we use to change the font size
   * command is the function that will be run within brackets
   * params is used in conjunction with vieCommand to send extra paramters needed for viewCommand
   */
  BrambleProxy.prototype.executeCommand = function(button, options) {
    var commandCategory = "menuCommand";
    var command;
    var params;

    if (button === "_undo") {
      command = "EDIT_UNDO";
    } else if (button === "_redo") {
      command = "EDIT_REDO";
    } else if (button === "_fontSize") {
      commandCategory = "fontChange";
      command = "VIEW_RESTORE_FONT_SIZE";
      if (options.data === "small") {
        params =  "10";
      } else if (options.data === "normal") {
        params =  "12";
      } else if (options.data === "large") {
        params =  "18";
      }
    } else if (button === "_spaceUnits") {
      commandCategory = "editorCommand";
      command = "setSpaceUnits";
      params = options.data;
    } else if (button === "_reload") {
      commandCategory = "reloadCommand";
    } else if (button === "_runJavascript") {
      commandCategory = "runJavascript";
      command = document.getElementById('preview-run-js').checked;
    }

    telegraph.postMessage(JSON.stringify({
      commandCategory: commandCategory,
      command: command,
      params: params
    }), this.editorHost);
  };

  BrambleProxy.prototype.on = function on(event, callback) {
    if (event === "change") {
      eventCBs.change.push(callback);
    } else if(event === "reparse") {
      eventCBs.reparse.push(callback);
    } else if(event === "loaded") {
      eventCBs.loaded.push(callback);
    } else if(event === "change:viewlink") {
      eventCBs.viewlink.push(callback);
    }
  };

  // We stub these functions at the moment so we don't
  // risk breaking Thimble's functionality,
  // but with a proper code audit they'll no
  // longer be needed
  function empty() {}
  BrambleProxy.prototype.refresh = empty;
  BrambleProxy.prototype.clearHistory = empty;
  BrambleProxy.prototype.focus = empty;

  // Called to trigger an update to the Thimble link
  // to view this make separate from the editor.
  BrambleProxy.prototype.setViewLink = function(link) {
    eventCBs["viewlink"].forEach(function (cb) {
      cb(link);
    });
  };

  return BrambleProxy;
});
