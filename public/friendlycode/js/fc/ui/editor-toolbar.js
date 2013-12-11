define(function(require) {
  var $ = require("jquery-tipsy"),
      Preferences = require("fc/prefs"),
      HistoryUI = require("fc/ui/history"),
      NavOptionsTemplate = require("template!nav-options"),
      TextUI = require("fc/ui/text");

  function HintsUI(options) {
    var self = {},
        hintsNavItem = options.navItem,
        hintsCheckbox = hintsNavItem.find(".checkbox");

    Preferences.on("change:showHints", function() {
      if (Preferences.get("showHints") === false)
        hintsCheckbox.removeClass("on").addClass("off");
      else
        hintsCheckbox.removeClass("off").addClass("on");
    });

    hintsNavItem.click(function() {
      var isDisabled = (Preferences.get("showHints") === false);
      Preferences.set("showHints", isDisabled);
      Preferences.save();
    });

    Preferences.trigger("change:showHints");
    return self;
  }

  return function Toolbar(options) {
    var self = {},
        div = options.container,
        panes = options.panes,
        navOptions = $(NavOptionsTemplate()).appendTo(div),
        saveButton = navOptions.find(".save-button"),
        publishButton = navOptions.find(".publish-button"),
        undoNavItem = navOptions.find(".undo-nav-item"),
        startSave, startPublish;

    var historyUI = HistoryUI({
      codeMirror: panes.codeMirror,
      undo: undoNavItem,
      redo: navOptions.find(".redo-nav-item")
    });

    var textUI = TextUI({
      codeMirror: panes.codeMirror,
      navItem: navOptions.find(".text-nav-item")
    });

    var hintsUI = HintsUI({
      navItem: navOptions.find(".hints-nav-item")
    });

    function onChangeTitle(title) {
      if (title.length)
        $(".preview-title", navOptions).text(title).show();
      else
        $(".preview-title", navOptions).hide();
    }

    panes.preview.on("change:title", onChangeTitle);
    onChangeTitle(panes.preview.title);

    // If the editor has no content, disable the publish button.
    panes.codeMirror.on("change", function() {
      var codeLength = panes.codeMirror.getValue().trim().length;
      [saveButton, publishButton].forEach(function(button) {
        button.toggleClass("enabled", codeLength ? true : false);
      });
      publishButton.toggleClass("enabled", codeLength ? true : false);
    });

    saveButton.click(function(){
      if ($(this).hasClass("enabled")) {
        startSave(this);
      }
    });

    publishButton.click(function(){
      if ($(this).hasClass("enabled")) {
        startPublish(this);
      }
    });

    self.refresh = function() {
      historyUI.refresh();
    };

    self.setStartSave = function(func) {
      startSave = func;
      saveButton.toggle(!!startSave);
    };

    self.setStartPublish = function(func) {
      startPublish = func;
      publishButton.toggle(!!startPublish);
    };

    // defaults are bound in friendlycode.js,
    // as publishUI.start(saveOnly) and as
    // publishUI.start(saveAndPublish), respectively.
    self.setStartSave(null);
    self.setStartPublish(null);

    return self;
  };
});
