window.addEventListener("beforeunload", function (e) {
  var confirmationMessage = "Are you sure?";
  e.returnValue = confirmationMessage;
  return confirmationMessage;
});
