define(["jquery"], function($) {

  // Run the given function `fn` when the key with `keyCode` is pressed down
  function KeyHandler(keyCode, fn) {
    this._handler = function(e) {
      if(e.which !== keyCode) {
        return;
      }

      e.stopPropagation();
      e.preventDefault();
      fn();
    };

    $(document).on("keydown", this._handler);
  }
  KeyHandler.prototype.stop = function() {
    $(document).off("keydown", this._handler);
  };

  // Helper for ESC key handling
  function EscKeyHandler(fn) {
    KeyHandler.call(this, 27, fn);
  }
  EscKeyHandler.prototype = KeyHandler.prototype;
  EscKeyHandler.prototype.constructor = EscKeyHandler;

  KeyHandler.ESC = EscKeyHandler;

  return KeyHandler;
});
