define(function(require) {

  var $ = require("jquery");
  var KeyHandler = require("fc/bramble-keyhandler");
  var Underlay = require("fc/bramble-underlay");

  function PopupMenu(button, menu) {
    var self = this;
    self._button$ = $(button);
    self._menu$ = $(menu);

    self.close = function() {
      if(!self.showing) {
        return;
      }

      $(window).off("resize", self.close);

      self._menu$.hide();

      if(self._underlay) {
        self._underlay.remove();
        self._underlay = null;
      }

      if(self._escKeyHandler) {
        self._escKeyHandler.stop();
        self._escKeyHandler = null;
      }

      delete self.showing;
    };

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
    var self = this;

    // Determine where to horizontally place menu based on button's icon location
    var menuWidth = self._menu$.width();
    var leftOffset = self._button$.offset().left - menuWidth/2 + 11;
    self._menu$.css("left", leftOffset).show();

    self._underlay = new Underlay(self._menu$, self.close);
    self._escKeyHandler = new KeyHandler.ESC(self.close);
    // Close on resize
    $(window).on("resize", self.close);

    self.showing = true;
  };

  return PopupMenu;
});
