(function() {
  var myProjectsButton = document.querySelector( ".my-projects-title" ),
      closeButton = document.querySelector( ".my-projects-close" ),
      iframe = document.querySelector( ".my-projects-iframe" ),
      friendlyCodeToolbar,
      friendlyCodePanes;

  function open() {
    myProjectsButton.addEventListener( "click", close, false );
    myProjectsButton.removeEventListener( "click", open, false );

    friendlyCodeToolbar = document.querySelector( ".friendlycode-toolbar" );
    friendlyCodePanes = document.querySelector( ".friendlycode-panes" );
    friendlyCodeToolbar.classList.add( "expanded" );
    friendlyCodePanes.classList.add( "expanded" );

    iframe.src = "/myprojects";
  }

  function close() {
    myProjectsButton.addEventListener( "click", open, false );
    myProjectsButton.removeEventListener( "click", close, false );

    friendlyCodeToolbar = document.querySelector( ".friendlycode-toolbar" );
    friendlyCodePanes = document.querySelector( ".friendlycode-panes" );
    friendlyCodeToolbar.classList.remove( "expanded" );
    friendlyCodePanes.classList.remove( "expanded" );
  }

  myProjectsButton.addEventListener( "click", open, false );
}());
