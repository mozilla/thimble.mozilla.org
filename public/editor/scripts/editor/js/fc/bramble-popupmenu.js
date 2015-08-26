define(function(require) {

  var $ = require("jquery");
  var KeyHandler = require("fc/bramble-keyhandler");
  var Underlay = require("fc/bramble-underlay");

  function PopupMenu(button, menu) {
    var self = this;
    self._button$ = $(button);
    self._menu$ = $(menu);

    // Toggle the menu on/off when the button is clicked.
    self._button$.on("click", function() {
      if(!self.showing) {
        self.show();
      } else {
        self.close();
      }
    });
  }
  PopupMenu.create = function(button, menu) {
    return new PopupMenu(button, menu);
  };
  PopupMenu.prototype.show = function() {
    // Determine where to horizontally place menu based on button's icon location

    var menuWidth = this._menu$.width();
    var leftOffset = this._button$.offset().left - menuWidth/2 + 11;
    this._menu$.css("left", leftOffset).show();

    this._underlay = new Underlay(this._menu$, this.close.bind(this));
    this._escKeyHandler = new KeyHandler.ESC(this.close.bind(this));
    // Close on resize
    $(window).on("resize", this.close.bind(this));

    this.showing = true;
  };
  PopupMenu.prototype.close = function() {
    this._menu$.hide();

    this._underlay.remove();
    this._underlay = null;

    this._escKeyHandler.stop();
    this._escKeyHandler = null;

    $(window).off("resize", this.close.bind(this));

    delete this.showing;
  };

  return PopupMenu;
});
