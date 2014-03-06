(function() {
  var stopTogether = document.getElementById("together-toggle").getAttribute("data-stop-together");
  var startTogether = document.getElementById("together-toggle").getAttribute("data-start-together");

  var btn = document.querySelector(".together-toggle"),
        started = false,
        setStartState = function(state) {
          return function () {
            started = state;
            btn.innerHTML = (started ? stopTogether : startTogether);
          };
        };

  // Start and stop notification, so that the preview
  // iframe doesn't spam us with events when togetherjs
  // is not actually running.
  TogetherJS.on("ready", setStartState(true));
  TogetherJS.on("close", setStartState(false));

  // proxy the mousemoved event from the preview iframe
  window.addEventListener("message", function(evt) {
    if(evt.source === window) return;

    try {
      var obj = JSON.parse(evt.data),
          elementFinder = TogetherJS.require("elementFinder"),
          element = document.querySelector(".preview-holder iframe"),
          location = elementFinder.elementLocation(element);

      if(["cursor-update", "cursor-click"].indexOf(obj.type) !== -1) {
        TogetherJS.require(["session"], function (session) {
          if(!started) return;
          session.send({
            type: obj.type,
            element: location,
            offsetX: obj.offsetX,
            offsetY: obj.offsetY
          });
        });
      }

    } catch (e) { }
  });

  btn.addEventListener("click", function toggleTogether() {
    TogetherJS(btn);
    return false;
  });

  TogetherJS.reinitialize();

}());
