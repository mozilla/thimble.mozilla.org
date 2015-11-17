/**
 * Thimble Remix and Analytics injection, automatically
 * added to published projects.
 */
(function(document, head){

  var gaTrackingId = 'UA-68630113-1';

  function customizeScroll($) {
    var bodyEl = $("body");
    var detailsBar = $(".remix-details-bar");
    var detailsBarHeight = 64;
    var currentPadding = parseInt(bodyEl.css("padding-top"));
    bodyEl.css("padding-top", currentPadding + detailsBarHeight);

    $(window).on("scroll", function() {
      var scrollDistance = $(this).scrollTop();
      if(scrollDistance >= detailsBarHeight) {
        detailsBar.addClass("scrolled");
      } else {
        detailsBar.removeClass("scrolled");
      }
    });
  }

  function getElapsedTime(lastEdited) {
    var now = Date.now();
    lastEdited = new Date(lastEdited);
    var elapsedTime, unit = "";
    var secondsElapsed = (now - lastEdited) / 1000;
    var minutesElapsed = secondsElapsed / 60;
    var hoursElapsed = minutesElapsed / 60;
    var daysElapsed = hoursElapsed / 24;

    if(daysElapsed > 31) {
      elapsedTime = "over a month";
    } else if(daysElapsed >= 1) {
      elapsedTime = Math.round(daysElapsed);
      unit = elapsedTime === 1 ? " day" : " days";
    } else if(hoursElapsed >= 1) {
      elapsedTime = Math.round(hoursElapsed);
      unit = elapsedTime === 1 ? " hour" : " hours";
    } else if(minutesElapsed >= 1) {
      elapsedTime = Math.round(minutesElapsed);
      unit = elapsedTime === 1 ? " minute" : " minutes";
    } else {
      elapsedTime = Math.round(secondsElapsed);
      unit = elapsedTime === 1 ? " second" : " seconds";
    }

    return elapsedTime + unit + " ago";
  }

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

  function injectDetailsBar($, metadata) {
    var detailsBarHtml =
    '\n<!-- Remix bar -->\n' +
    '<div class="remix-details-bar cleanslate">\n' +
    '    <a class="thimble-logo" href="https://thimble.mozilla.org">\n' +
    '        <span class="remix-icon"></span>\n' +
    '    </a>\n' +
    '    <h1 class="remix-project-title"></h1>\n' +
    '    <div class="remix-project-meta"><a class="remix-project-author" href="#"></a></div>\n' +
    '    <div class="details-bar-remix-button-wrapper">\n' +
    '        <a class="details-bar-remix-button">Remix</a>\n' +
    '    </div>\n' +
    '</div>\n' +
    '<!-- End of Remix bar -->\n';

    $(detailsBarHtml).prependTo("body");
    $(".remix-project-title").text(metadata.projectTitle);
    $(".remix-project-author").text(metadata.projectAuthor);
    $(".remix-project-meta").append(document.createTextNode(" - " + getElapsedTime(metadata.dateUpdated)));

    $(".details-bar-remix-button").attr("href", metadata.host + "/projects/" + metadata.projectId + "/remix");
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
      injectDetailsBar($, metadata);
      customizeScroll($);
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
