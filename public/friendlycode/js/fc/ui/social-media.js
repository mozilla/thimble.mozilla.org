/**
 * A tiny library for load-loading social media share buttons.
 * If we don't do this, social media will track users even before
 * they click the like button and we don't like that kind of
 * monitoring behaviour.
 */
define(["localized"], function(localized) {
  "use strict";

  return function SocialMedia() {

    /**
     * The various social media all have the same API.
     */
    var self = {
      facebook: {
        id: "facebook-jssdk",
        src: "//connect.facebook.net/en_US/all.js#xfbml=1",
        html: function(url) {
          return "<div class='fb-like' data-href='"+url+"' data-send='false' data-action='recommend' data-layout='button_count' data-show-faces='false' data-font='tahoma'></div>";
        },
        afterHotLoad: function() {
          // Facebook needs additional help, because it needs
          // to be told that it has to refresh its button, rather
          // than simply reloading.
          if (typeof(FB) === "object" && FB.XFBML && FB.XFBML.parse) {
            FB.XFBML.parse();
          }
        }
      },



      google: {
        id: "google-plus",
        src: "//apis.google.com/js/plusone.js",
        html: function(url) {
          return "<g:plusone annotation='none' href='"+url+"'></g:plusone>";
        }
      },

      twitter: {
        id: "twitter-wjs",
        src: "//platform.twitter.com/widgets.js",
        html: function(url) {
          return "<a href='https://twitter.com/share'class='twitter-share-button' data-text='" + localized.get('default-tweet') + " ' data-url='"+url+"' data-via='Webmaker' data-count='none'>" + localized.get('tweet') + "</a>";
        }
      },

      /**
       * Hot-load a social medium's button by first
       * injecting the necessary HTML for the medium
       * to perform its own iframe replacements, and
       * then late-loading the script required for
       * the medium to load up its functionality.
       */
      hotLoad:  function(element, socialMedium, url) {
        var oldScript = document.getElementById(socialMedium.id);
        if (oldScript)
          oldScript.parentNode.removeChild(oldScript);
        // TODO: Should we escape url? It's likely
        // to not contain any characters that need escaping, and its value
        // is trusted, but we may still want to do it.
        var html = socialMedium.html(url);
        element.innerHTML = html;
        (function(document, id, src, url) {
          var script = document.createElement("script");
          script.type = "text/javascript";
          script.id = id;
          script.src = src;
          document.head.appendChild(script);
        }(document, socialMedium.id, socialMedium.src));
        if (socialMedium.afterHotLoad)
          socialMedium.afterHotLoad();
      }
    };
    return self;
  };
});
