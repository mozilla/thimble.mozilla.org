var tryAgainButton = document.querySelector(".try-again");

if (tryAgainButton) {
  tryAgainButton.addEventListener("click", function() {
    window.location.reload(true);
  });
}
