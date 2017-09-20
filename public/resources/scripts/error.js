var tryAgainButton = document.querySelector(".try-again");

if (tryAgainButton) {
  tryAgainButton.addEventListener("click", function() {
    window.top.location.reload(true);
  });
}
