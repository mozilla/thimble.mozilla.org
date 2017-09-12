/* globals $: true */

var $ = require("jquery");

// Run the given function `fn` when the key with `keyCode` is pressed down
function KeyHandler(keyCode, elem, fn) {
  if (typeof keyCode !== "number") {
    fn = elem;
    elem = keyCode;
    keyCode = null;
  }

  function handler(e) {
    if (!keyCode) {
      return fn(e);
    }

    if (e.which !== keyCode) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();
    fn(e);
  }

  if (typeof elem === "function") {
    fn = elem;
    elem = document;
  }

  $(elem).on("keyup", handler);

  this.stop = function() {
    $(elem).off("keyup", handler);
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

// Helper for any key being pressed to check the title length
function AnyKeyHandler(elem, fn) {
  KeyHandler.call(this, elem, fn);
}
AnyKeyHandler.prototype = KeyHandler.prototype;
AnyKeyHandler.prototype.constructor = AnyKeyHandler;
KeyHandler.Any = AnyKeyHandler;

module.exports = KeyHandler;
