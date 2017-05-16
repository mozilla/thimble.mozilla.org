var tryAgainButton = document.querySelector(".try-again") || null;

if(tryAgainButton) {
  tryAgainButton.addEventListener("click",function(){
    window.location.reload(true);
  });
}
