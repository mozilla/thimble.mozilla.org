"use strict";

define(function() {  
  return {
    description: "Strings for the user interface.",
    root: {
      "page-load-err": 'Sorry, an error occurred while trying to get the page.',
      "publish-err": 'Sorry, an error occurred while trying to publish.',
      "facebook-locale": "en_US",
      "default-tweet": "Check out the #MozThimble page I just made:",
      "tweet": "Tweet"
    },
    metadata: {
      "facebook-locale": {
        help: "Locale passed to Facebook for social media actions."
      }
    }
  };
});
