(function() {
  var myProjectsButton = document.querySelector( ".my-projects-title" ),
      container = document.querySelector( ".my-projects-container" ),
      iframe = document.querySelector( ".my-projects-iframe" );

  function open() {
    myProjectsButton.addEventListener( "click", close, false );
    myProjectsButton.removeEventListener( "click", open, false );

    container.style.zIndex = 5;
    container.style.position = "relative";
    iframe.style.height = "300px"

    iframe.src = iframe.src;
  }

  function close() {
    myProjectsButton.addEventListener( "click", open, false );
    myProjectsButton.removeEventListener( "click", close, false );

    container.style.zIndex = "";
    container.style.position = "";
    iframe.style.height = ""
  }

  myProjectsButton.addEventListener( "click", open, false );
}());
