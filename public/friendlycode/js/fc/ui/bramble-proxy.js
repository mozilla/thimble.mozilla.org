// This file is the friendlycode half of a proxy layer between Thimble's live preview
// window and bramble's codemirror instance. It was designed to map to existing
// friendlycode use of codemirror, with the exception of duplicate functionality
// between bramble and friendlycode that bramble already provides (or will)
define(["backbone-events"], function(BackboneEvents) {
  "use strict";

  var eventCBs = {
    "change": [],
    "reparse": []
  };

  function BrambleProxy(place, givenOptions) {
    var iframe = document.createElement("iframe");
    var latestSource = "(none)";
    var telegraph;

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
      if (message.type == "bramble:change") {
        latestSource = message.sourceCode;
        eventCBs["change"].forEach(function(cb){
          cb();
        });
        return;
      }
      if (message.type == "bramble:init") {
        telegraph.postMessage(JSON.stringify({
          type: "bramble:init",
          source: latestSource
        }), "*");
      }
    });

    // Create CodeMirror-like interface for friendlycode to use
    this.getValue = function() {
      return latestSource;
    };

    this.getWrapperElement = function(){
      return place;
    }

    this.init = function(make) {
      latestSource = make;

      // Tell the iframe to load bramble
      iframe.src = givenOptions.appUrl + "/friendlycode/vendor/brackets/src";
      iframe.id = "webmaker-bramble";

      // Attach the iframe to the dom
      place.append(iframe);
    }
  }

  BrambleProxy.prototype.on = function on(event, callback) {
    if (event === "change") {
      eventCBs.change.push(callback);
    } else if(event === "reparse") {
      eventCBs.reparse.push(callback);
    }
  };

  // Stubs
  function empty() {};
  BrambleProxy.prototype.refresh = empty;
  BrambleProxy.prototype.clearHistory = empty;
  BrambleProxy.prototype.focus = empty;

  BrambleProxy.signal = function signal(proxyInstance, eventType, data) {
    eventCBs["reparse"].forEach(function (cb){
      cb({
        error: data.error,
        sourceCode: data.sourceCode,
        document: data.document
      });
    });
  };

  // Replaces
  BrambleProxy.prototype.setViewLink = function(link) {
    this.trigger("change:viewlink", link);
  };
  BackboneEvents.mixin(BrambleProxy.prototype);

  return BrambleProxy;
});
