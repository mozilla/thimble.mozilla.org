(function() {
  var myProjectsButton = document.querySelector( ".my-projects-title" ),
      container = $( ".my-projects-container" ),
      iframe = document.querySelector( ".my-projects-iframe" );

  function open() {
    myProjectsButton.addEventListener( "click", close, false );
    myProjectsButton.removeEventListener( "click", open, false );

    container.addClass("open");

    iframe.src = iframe.src;
  }

  function close() {
    myProjectsButton.addEventListener( "click", open, false );
    myProjectsButton.removeEventListener( "click", close, false );

    container.removeClass("open");
  }

  myProjectsButton.addEventListener( "click", open, false );
}());
