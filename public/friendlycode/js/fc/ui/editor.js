define([
  "jquery",
  "template!nav-options",
  "fc/bramble-ui-bridge"
], function($, navOptionsTemplate, BrambleUIBridge) {
  return function Editor(options) {
    var container = options.container.empty()
          .addClass("friendlycode-base"),
        toolbarDiv = $('<div class="friendlycode-toolbar"></div>')
          .appendTo(container);

    // Add the editor toolbar
    $(navOptionsTemplate()).appendTo(toolbarDiv);

    function init(config, initFs) {
      if(typeof config === "function") {
        initFs = config;
        config = null;
      }

      // Start loading Bramble
      Bramble.load("#webmaker-bramble",{
        url: options.editorUrl
      });

      // Event listeners
      Bramble.once("ready", function(bramble) {
        // For debugging, attach to window.
        window.bramble = bramble;
        BrambleUIBridge.init(bramble, config);
      });

      Bramble.on("error", function(err) {
        console.log("error", err);
      });

      initFs(function(err, config) {
        if(err) {
          throw err;
        }

        // Now that fs is setup, tell Bramble which root dir to mount
        // and which file within that root to open on startup.
        Bramble.mount(config.root, config.open);
      });
    }

    return {
      init: init
    };
  };
});
