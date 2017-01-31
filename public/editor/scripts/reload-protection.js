function unloadProtection(e) {
  var confirmationMessage = "Data will be lost if you leave. Are you sure?";
  e.returnValue = confirmationMessage;
  return confirmationMessage;
}

define(function(require) {
  return {
    enable: function() {
      window.addEventListener("beforeunload", unloadProtection);
    },
    disable: function() {
      window.removeEventListener("beforeunload", unloadProtection);
    }
  }
})
