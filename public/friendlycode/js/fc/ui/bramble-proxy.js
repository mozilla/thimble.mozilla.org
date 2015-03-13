// This file is the friendlycode half of a proxy layer between Thimble functionality
// (like publishing) and bramble's codemirror instance. It was designed to map to existing
// friendlycode use of codemirror, with the exception of duplicate functionality
// between bramble and friendlycode that bramble already provides (or will)
/*global define */
define(["backbone-events", "fc/prefs"], function(BackboneEvents, Preferences) {
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
    iframe = document.createElement("iframe");
    var latestSource = "(none)";
    var prefSize = Preferences.get("textSize");
    var that = this;
    var lastLine = 0;
    var scrollInfo;

    function communicateEditMessage(fn) {
      var argLen = arguments.length;
      var callback = typeof arguments[argLen - 1] === "function" ? arguments[argLen - 1] : undefined;
      var params = Array.prototype.slice.call(arguments, 1, callback ? argLen - 1 : argLen);

      if(callback) {
        window.addEventListener("message", function editReceiver(e) {
          var message = JSON.parse(e.data);

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
      }), "*");
    }

    // Event listening for proxied event messages from our editor iframe.
    window.addEventListener("message", function(evt) {
      // Set the communication channel to our iframe
      // now that it's signaled that it has content
      // by sending a postMessage
      telegraph = iframe.contentWindow;
      var message = JSON.parse(evt.data);

      if (typeof message.type !== "string" || message.type.indexOf("bramble") === -1) {
        return;
      }

      if (message.type === "bramble:change") {
        latestSource = message.sourceCode;
        lastLine = message.lastLine;
        if(message.scrollInfo) scrollInfo = message.scrollInfo;

        eventCBs["change"].forEach(function(cb) {
          cb();
        });
        return;
      }

      if (message.type === "bramble:init") {
        telegraph.postMessage(JSON.stringify({
          type: "bramble:init",
          source: latestSource
        }), "*");
        return;
      }

      if (message.type === "bramble:loaded") {
        eventCBs["loaded"].forEach(function(cb) {
          cb();
        });
        that.executeCommand("_fontSize", { data : prefSize });
        that.executeCommand("_spaceUnits", { data : 2 });
        return;
      }

      if (message.type === "bramble:viewportChange") {
        scrollInfo = message.scrollInfo;
      }
    });

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

    this.init = function(make) {
      latestSource = make;

      // Tell the iframe to load bramble
      iframe.src = options.appUrl + options.editorUrl;
      iframe.id = "webmaker-bramble";

      // Attach the iframe to the dom
      place.append(iframe);
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
   *    viewCommand: View Command, refers to commands inside the ViewHandler
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
      commandCategory = "viewCommand";
      command = "setFontSize";
      if (options.data === "small") {
        params =  "10";
      } else if (options.data === "normal") {
        params =  "12";
      } else if (options.data === "large") {
        params =  "18";
      }
      params+= "px";
    } else if (button === "_spaceUnits") {
      commandCategory = "editorCommand";
      command = "setSpaceUnits";
      params = options.data;
    }

    telegraph.postMessage(JSON.stringify({
      commandCategory: commandCategory,
      command: command,
      params: params
    }), "*");
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
  function empty() {};
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
