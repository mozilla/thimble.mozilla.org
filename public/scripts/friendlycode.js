(function() {
  var localeInfo_lang = document.getElementById("friendly-code").getAttribute("data-localeInfo-lang"),
      previewLoader = document.getElementById("friendly-code").getAttribute("data-preview-loader"),
      pageToLoad = document.getElementById("friendly-code").getAttribute("data-page-to-load"),
      appUrl = document.getElementById("friendly-code").getAttribute("data-app-url"),
      allowJS = document.getElementById("friendly-code").getAttribute("data-allow-js");
      makeDetails = document.getElementById("friendly-code").getAttribute("data-make-details");

  // unpack makedetails
  makeDetails = JSON.parse(decodeURIComponent(makeDetails));

  /**
   * ...
   */
  define("hackpub", ["jquery", "selectize"], function($, selectize) {

    // set up CSRF handling
    var csrf_token = $("meta[name='csrf-token']").attr("content");
    $("#supportedLocales").selectize();

    return function Hackpub(options) {
      return {
        loadCode: function(path, cb) {
          var url = path;
          $.ajax({
            type: "GET",
            url: url,
            dataType: 'text',
            error: function(req) {
              cb(req);
            },
            success: function(html) {
              cb(null, html, url);
            }
          });
        },
        saveCode: function(data, originalURL, cb) {
          $.ajax({
            type: "POST",
            url: options.hackpubURL + "/" + localeInfo_lang + "/publish",
            data: {
              'html': data.html,
              'proxied': data.proxied,
              'metaData': data.metaData,
              'published': data.published,
              'pageOperation': $("meta[name='thimble-operation']").attr("content"),
              'origin': $("meta[name='thimble-project-origin']").attr("content")
            },
            dataType: 'json',
            beforeSend: function(request) {
              request.setRequestHeader('X-CSRF-Token', csrf_token); // express.js uses a non-standard name for csrf-token
            },
            error: function(req) {
              cb(req);
            },
            success: function(result) {
              var origin = $("meta[name='thimble-project-origin']").attr("content");
              cb(null, {path: result['remix-id'], url: result['published-url']});
              // If we were a remix, update the new page's origin.
              if ($("meta[name='thimble-operation']").attr("content") === "remix" || !origin) {
                origin = result['remix-id'];
                $("meta[name='thimble-project-origin']").attr("content",origin);
              }
              $("meta[name='thimble-operation']").attr("content","edit");

              // Disable the accidental page-navigation protection
              // right after a publish:
              data.dataProtector.disableDataProtection();
            }
          });
        }
      };
    };
  });

  /**
   * This code sets up the various Friendlycode values for
   * publication and remixing.
   */
  define("thimblePage",
         ["jquery", "friendlycode", "hackpub", "/scripts/tutorials.js", "languages"],
         function($, FriendlycodeEditor, Hackpub, tutorials, Languages) {

    var makeUrl = document.getElementById("friendly-code").getAttribute("data-make-url"),
        makeEndpoint = document.getElementById("friendly-code").getAttribute("data-make-endpoint");

    // Call this when language picker element is ready.
    Languages.ready({ position: "bottom", arrow: "top" }, true);

    var editor = FriendlycodeEditor({
      allowJS: allowJS,
      previewLoader: previewLoader,
      pageToLoad: pageToLoad,
      publisher: Hackpub({
        hackpubURL: appUrl,
        publishURL: appUrl + "/project",
      }),
      remixURLTemplate: appUrl + "/" + localeInfo_lang + "/project/\{\{VIEW_URL\}\}/edit",
      container: $("#bare-fc-holder"),
      makeDetails: makeDetails,
      appUrl: appUrl
    });

    if (makeUrl) {
      tutorials.load(makeUrl, makeEndpoint, editor.editor);
    }

    if (typeof TogetherJS !== "undefined") {
      TogetherJS.reinitialize();
    }

    return editor;
  });
}());
