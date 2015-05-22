(function() {
  require(["jquery", "cookies-js"], function($, Cookies) {

    if(Cookies.get("switch-thimble") === "yes") {
      window.location.replace("http://example.com");
    }

    $( document ).ready(function() {
      if(!Cookies.get("switch-thimble")) {
  		  $("#switch-thimble-dialog").fadeIn("slow", function() {});
      }
      console.log("Loaded");
    });

    $("#switch-thimble-dialog-yes").click(function() {
      Cookies.set("switch-thimble", "yes");
      window.location.replace("http://example.com");
    });

    $("#switch-thimble-corner-ribbon").click(function() {
      $("#switch-thimble-dialog").fadeIn("slow", function() {});
      console.log("Corner ribbon pressed");
    });

    $("#switch-thimble-dialog-no").click(function() {
      $("#switch-thimble-dialog").fadeOut("slow", function() {});

      Cookies.set("switch-thimble", "no");
    });
  });
}());
