define(function(require) {

  var $ = require("jquery");

  // Run the given function `fn` when the key with `keyCode` is pressed down
  function KeyHandler(keyCode, elem, fn) {
    function handler(e) {
      if(e.which !== keyCode) {
        return;
      }

      e.stopPropagation();
      e.preventDefault();
      fn();
    }

    if(typeof elem === "function") {
      fn = elem;
      elem = document;
    }

    $(elem).on("keydown", handler);

    this.stop = function() {
      $(elem).off("keydown", handler);
    };
  }

  // Helper for ESC key handling
  function EscKeyHandler(elem, fn) {
    KeyHandler.call(this, 27, elem, fn);
  }
  EscKeyHandler.prototype = KeyHandler.prototype;
  EscKeyHandler.prototype.constructor = EscKeyHandler;
  KeyHandler.ESC = EscKeyHandler;

  // Helper for Enter key handling
  function EnterKeyHandler(elem, fn) {
    KeyHandler.call(this, 13, elem, fn);
  }
  EnterKeyHandler.prototype = KeyHandler.prototype;
  EnterKeyHandler.prototype.constructor = EnterKeyHandler;
  KeyHandler.Enter = EnterKeyHandler;

  return KeyHandler;
});
