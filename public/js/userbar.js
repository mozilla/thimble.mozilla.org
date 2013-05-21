(function() {
  var myProjectsButton = document.querySelector( ".my-projects-title" ),
      container = $( ".my-projects-container" ),
      iframe = document.querySelector( ".my-projects-iframe" );

  function open() {
    myProjectsButton.addEventListener( "click", close, false );
    myProjectsButton.removeEventListener( "click", open, false );
    container.addClass("open");
  }

  function close() {
    myProjectsButton.addEventListener( "click", open, false );
    myProjectsButton.removeEventListener( "click", close, false );

    container.removeClass("open");
  }

  myProjectsButton.addEventListener( "click", open, false );

  window.userBar = {
    set: function(email) {
      if(email) {
        $(myProjectsButton).removeClass("hidden");
      } else {
        $(myProjectsButton).addClass("hidden");
      }
      iframe.src = iframe.src.replace(/email=.*/,"email="+email);
    },
    update: function() {
      iframe.src = iframe.src;
    }
  };
}());
