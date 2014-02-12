define(function(require) {
  var $ = require("jquery-tipsy"),
      Preferences = require("fc/prefs"),
      HistoryUI = require("fc/ui/history"),
      NavOptionsTemplate = require("template!nav-options"),
      TextUI = require("fc/ui/text"),
      analytics = require("analytics");

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
      var showHints = !Preferences.get("showHints");
      analytics.event( "Show Hints", {
        label: showHints ? "Enabled" : "Disabled"
      });
      Preferences.set("showHints", showHints);
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
        publishButton = navOptions.find(".publish-button"),
        undoNavItem = navOptions.find(".undo-nav-item"),
        startPublish;

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

    // published-page link handling
    function onChangeViewLink(link) {
      var viewButton = $(".page-view-button", navOptions),
          viewLink = $(".page-view-link");
      viewLink.attr("href", "#");
      if (link) {
        viewButton.css("display", "inline-block");
        viewLink.attr("href", link);
      }
    }
    panes.preview.on("change:viewlink", onChangeViewLink);
    onChangeViewLink( $('body').data('make-url') || false);


    // If the editor has no content, disable the publish button.
    panes.codeMirror.on("change", function() {
      var codeLength = panes.codeMirror.getValue().trim().length;
      publishButton.toggleClass("enabled", codeLength ? true : false);
    });
    publishButton.click(function(){
      if ($(this).hasClass("enabled")) startPublish(this);
    });

    self.refresh = function() {
      historyUI.refresh();
    };
    self.setStartPublish = function(func) {
      startPublish = func;
      publishButton.toggle(!!startPublish);
    };
    self.showDataRestoreHelp = function() {
      // Display a non-modal message telling the user that their
      // previous data has been restored, and that they can click 'undo'
      // to go back to the original version of the editor content.
      // This is just a temporary workaround to avoid confusion until
      // we figure out a better solution; see this issue for more
      // discussion:
      //
      // https://github.com/mozilla/webpagemaker/issues/53
      undoNavItem.tipsy({
        gravity: 'n',
        fade: true,
        trigger: 'manual',
        title: 'data-restore-help',
        className: 'friendlycode-base'
      }).tipsy("show");
      setTimeout(function() { undoNavItem.tipsy("hide"); }, 6000);
    };

    self.setStartPublish(null);
    return self;
  };
});
