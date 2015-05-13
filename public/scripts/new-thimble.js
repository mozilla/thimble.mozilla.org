(function() {
  require(["jquery", "cookies-js"], function($, Cookies) {

    if(Cookies.get("thimble-switch") === "yes") {
      window.location.replace("http://example.com");
    }

    $( document ).ready(function() {
      if(!Cookies.get("thimble-switch")) {
  		  $("#new-thimble-dialog").fadeIn("slow", function() {});
      }
    });

    $("#new-thimble-dialog-yes").click(function() {
      Cookies.set("thimble-switch", "yes");
      window.location.replace("http://example.com");
    });

    $("#new-thimble-corner-ribbon").click(function() {
      $("#new-thimble-dialog").fadeIn("slow", function() {});
    });

    $("#new-thimble-dialog-no").click(function() {
      $("#new-thimble-dialog").fadeOut("slow", function() {});

      Cookies.set("thimble-switch", "no");
      console.log(Cookies.get("thimble-switch"));
    });
  });
}());
