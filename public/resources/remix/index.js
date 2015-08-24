// Taken from https://github.com/flukeout/thimble-home

var detailsBarHtml =
'\n<!-- Remix bar -->\n' +
'<div class="remix-details-bar">\n' +
'    <a class="thimble-logo" href="https://bramble.mofostaging.net">\n' +
'        <span class="remix-icon"></span>\n' +
'    </a>\n' +
'    <h1 class="remix-project-title"></h1>\n' +
'    <div class="remix-project-meta"><a class="remix-project-author" href="#"></a></div>\n' +
'    </div>\n\n' +
'    <div class="details-bar-remix-button-wrapper">\n' +
'        <a class="details-bar-remix-button">Remix</a>\n' +
'    </div>\n' +
'<!-- End of Remix bar -->\n';

function customizeScroll($) {
  $(window).on("scroll", function() {
    var scrollDistance = $(this).scrollTop();
    if(scrollDistance >= 64) {
      $("body").addClass("scrolled");
    } else {
      $("body").removeClass("scrolled");
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

function injectDetailsBar($, metadata) {
  $(detailsBarHtml).prependTo("body");
  $(".remix-project-title").text(metadata.projectTitle);
  $(".remix-project-author").text(metadata.projectAuthor);
  $(".remix-project-meta").append(document.createTextNode(" - " + getElapsedTime(metadata.dateUpdated)));

  $(".details-bar-remix-button").attr("href", metadata.host + "/projects/" + metadata.projectId + "/remix");
}

function injectStyleSheet($, metadata) {
  var stylesheet = "<link href=\"" + metadata.host + "/resources/remix/style.css\" rel=\"stylesheet\">";
  $("head").append(stylesheet);
}

function getMetadata($) {
  var metadata = {};
  var metaTags = $("meta");

  $.grep(metaTags, function(elem, index) {
    return /^data-remix-.+/.test($(metaTags[index]).attr("name"));
  })
  .forEach(function(metaTag) {
    metaTag = $(metaTag);
    metadata[metaTag.attr("name").replace(/^data-remix-/, "")] = metaTag.attr("content");
  });

  return metadata;
}

function run() {
  var $$ = $.noConflict(true);
  $$(document).ready(function($) {
    var metadata = getMetadata($);

    injectStyleSheet($, metadata);
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
