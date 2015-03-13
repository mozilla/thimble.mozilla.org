define(["jquery", "fc/prefs", "analytics"], function($, Preferences, analytics) {
  "use strict";

  return function(options) {
    var codeMirror = options.codeMirror;
    var navItem = options.navItem;
    var menu = navItem.find("ul");
    var menuItems = menu.find("li");

    function menuItem(size) {
      var item = $("li[data-size=" + size + "]", menu);
      return item.length ? item : null;
    }

    Preferences.on("change:textSize", function() {
      var size = $("li[data-default-size]", menu).attr("data-size");
      var prefSize = Preferences.get("textSize");
      if (prefSize && typeof(prefSize) == "string" && menuItem(prefSize))
        size = prefSize;

      $(codeMirror.getWrapperElement()).attr("data-size", size);
      codeMirror.refresh();

      // Mark text size in drop-down.
      menuItems.removeClass("selected");
      menuItem(size).addClass("selected");
    });

    /**
     * Show or hide the font size drop-down menu
     */
    navItem.hover(function() {
      var t = $(this),
          lp = t.position().left;
      menu.css("display","inline")
        .css("left", (lp-1) + "px").css("top","7px");
      return false;
    }, function() {
      menu.hide();
    });

    /**
     * bind the resize behaviour to the various text resize options
     */
    menuItems.click(function() {
      var textSize = $(this).attr("data-size");
      analytics.event("Font Size", {
        label: textSize
      });
      Preferences.set("textSize", textSize);
      codeMirror.executeCommand("_fontSize", { data : textSize } );
      Preferences.save();
      menu.hide();
    });

    Preferences.trigger("change:textSize");
  };
});
