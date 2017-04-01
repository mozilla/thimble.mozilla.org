define(function(require) {

  var $ = require("jquery");
  var KeyHandler = require("fc/bramble-keyhandler");
  var Underlay = require("fc/bramble-underlay");

  function PopupMenu(button, menu, applyOffset) {
    var self = this;
    self._button$ = $(button);
    self._menu$ = $(menu);

    // If we want the menu offset as a "bubble" we need to apply it
    if(applyOffset) {
      self.applyOffset = function() {
        // Determine where to horizontally place menu based on button's icon location
        var menuWidth = self._menu$.width();
        var leftOffset = self._button$.offset().left - menuWidth/2 + 11;
        var iconWidth = self._button$.width();
        var arrowOffset = menuWidth/2 - iconWidth/2;
        if(leftOffset < 0) {
          arrowOffset = menuWidth/2 - iconWidth/2 + leftOffset;
          leftOffset = 0;
        }
        self._menu$.find(".arrow-tip").css("left", arrowOffset);
        self._menu$.css("left", leftOffset);
      };
    }

    self.close = function(e) {
      if(e) {
        e.stopPropagation();
      }
      if(!self.showing) {
        return;
      }

      $(window).off("resize", self.close);
      self._button$.closest(".dropdown").removeClass("expanded");

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
    self._button$.on("click", function(e) {
      e.stopPropagation();

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
  PopupMenu.createWithOffset = function(button, menu) {
    return new PopupMenu(button, menu, true);
  };
  PopupMenu.prototype.show = function() {
    var self = this;

    if(self.applyOffset) {
      self.applyOffset();
    }

    self._menu$.show();
    self._underlay = new Underlay(self._menu$, self.close);
    self._escKeyHandler = new KeyHandler.ESC(self.close);
    self._button$.closest(".dropdown").addClass("expanded");
    // Close on resize
    $(window).on("resize", self.close);

    self.showing = true;
  };

  return PopupMenu;
});
