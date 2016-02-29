/**
 * Thimble Remix and Analytics injection, automatically
 * added to published projects.
 */
(function(document, head) {

  var gaTrackingId = 'UA-68630113-1';

  function injectAnalytics($) {
    var analyticsHtml =
    '\n<script>\n' +
    '(function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){\n' +
    '(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n' +
    'm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n' +
    '})(window,document,\'script\',\'//www.google-analytics.com/analytics.js\',\'ga\');\n' +
    'ga(\'create\', \'' + gaTrackingId + '\', \'auto\');\n' +
    'ga(\'send\', \'pageview\');\n' +
    '</script>\n';

    $(head).append(analyticsHtml);
  }

  function setupBar(err, $) {
    if(err) {
      console.log("[Thimble Error] Unable to inject Remix UI. Error was: `" + err + "`");
      return;
    }

    var isTouchDevice = 'ontouchstart' in document.documentElement;
    var detailsBar = $(".details-bar");
    detailsBar.attr("style", "");

    if(isTouchDevice) {
      detailsBar.addClass("touch-mode");
    } else {
      detailsBar.addClass("mouse-mode");
    }

    detailsBar.on("click", ".thimble-button",function(){
      detailsBar.removeClass("collapsed");
      return false;
    });

    detailsBar.on("click", ".close-details-bar", function(){
      detailsBar.addClass("collapsed");
      return false;
    });

    $(".mouse-mode").on("mouseenter",function(){
      detailsBar.removeClass("collapsed");
    });

    $(".mouse-mode").on("mouseleave",function(){
      detailsBar.addClass("collapsed");
    });
  }

  function injectDetailsBar($, metadata, callback) {
    $.ajax({
      url: metadata.host + "/projects/remix-bar",
      cache: false,
      accepts: "text/html",
      dataType: "html",
      data: {
        host: metadata.host,
        id: metadata.projectId,
        title: metadata.projectTitle,
        author: metadata.projectAuthor,
        updated: metadata.dateUpdated
      }
    })
    .done(function(response) {
      $(response).prependTo("body");
      callback(null, $);
    })
    .fail(function(jqXHR, textStatus) {
      callback(textStatus);
    });
  }

  function injectStyleSheets($, metadata) {
    var stylesheets =
      "<link href=\"" + metadata.host + "/resources/remix/clean-slate.min.css\" rel=\"stylesheet\">\n" +
      "<link href=\"" + metadata.host + "/resources/remix/style.css\" rel=\"stylesheet\">\n";
    $("head").append(stylesheets);
  }

  function getMetadata($) {
    var metadata = {};
    var metaTags = $("meta");

    $.grep(metaTags, function(elem, index) {
      return /^data-remix-.+/.test($(metaTags[index]).attr("name"));
    })
    .forEach(function(metaTag) {
      metaTag = $(metaTag);
      var key = metaTag.attr("name").replace(/^data-remix-/, "");
      // We see if a value for the current attribute already exists.
      // If it does, that means that we already encountered a meta tag
      // with that name which will refer to a more recent value than the
      // current one (we add the most recent values above all other values in
      // the <head> tag's contents).
      metadata[key] = metadata[key] || metaTag.attr("content");
    });

    return metadata;
  }

  function run() {
    var $$ = $.noConflict(true);
    $$(document).ready(function($) {
      var metadata = getMetadata($);
      injectAnalytics($);
      injectStyleSheets($, metadata);
      injectDetailsBar($, metadata, setupBar);
    });
  }

  (function(doc, script) {
    script = doc.createElement("script");
    script.type = "text/javascript";
    script.onload = run;
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js";
    doc.getElementsByTagName("head")[0].appendChild(script);
  }(document));

}(document, document.head));
