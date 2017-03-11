/**
 * Thimble Remix and Analytics injection, automatically
 * added to published projects.
 */
(function(document, head) {

  var gaTrackingId = 'UA-68630113-1';

  function injectAnalytics() {
    var analyticsHtml = document.createElement("script");
    analyticsHtml.type = "text/javascript";
    analyticsHtml.innerHTML = '(function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){\n' + '(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n' + 'm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n' + '})(window,document,\'script\',\'//www.google-analytics.com/analytics.js\',\'ga\');\n' + 'ga(\'create\', \'' + gaTrackingId + '\', \'auto\');\n' + 'ga(\'send\', \'pageview\');\n';
    head.appendChild(analyticsHtml);
  }

  function setupBar(err) {
    if(err) {
      console.log("[Thimble Error] Unable to inject Remix UI. Error was: `" + err + "`");
      return;
    }

    var isTouchDevice = 'ontouchstart' in document.documentElement;
    var detailsBar = document.querySelector(".details-bar");
    detailsBar.setAttribute("style", "");

    if(isTouchDevice) {
      detailsBar.classList.add("touch-mode");
    }
    else {
      detailsBar.classList.add("mouse-mode");
    }

    detailsBar.addEventListener("click", function(event) {
      if (event.target.className == "thimble-button") {
        detailsBar.classList.remove("collapsed");
        return false;
      }
    });

    detailsBar.addEventListener("click", function(event) {
      if (event.target.className == "close-details-bar") {
        detailsBar.classList.add("collapsed");
        return false;
      }
    });

    document.querySelector(".mouse-mode").addEventListener("mouseenter", function(){
      detailsBar.classList.remove("collapsed");
    });

    document.querySelector(".mouse-mode").addEventListener("mouseleave", function(){
      detailsBar.classList.add("collapsed");
    });
  }

  function injectDetailsBar(metadata, callback) {
    var xmlhttp = new XMLHttpRequest();
    var url = metadata.host + "/projects/remix-bar";
    var data = {
      host: metadata.host,
      id: metadata.projectId,
      title: metadata.projectTitle,
      author: metadata.projectAuthor,
      updated: metadata.dateUpdated
    };

    xmlhttp.onreadystatechange = function(response, textStatus) {
      if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
        if (xmlhttp.status == 200) {
          var responseTag = document.createElement("span");
          responseTag.innerHTML = response;
          document.body.insertBefore(responseTag, document.body.firstChild);
	    callback(null);
        }
        else if (xmlhttp.status == 400) {
	    callback(textStatus);
        }
      }
    };

    xmlhttp.open("POST", url, true);
    xmlhttp.send(data);
  }

  function injectStyleSheets(metadata) {
    var stylesheet1 = document.createElement("link");
    stylesheet1.rel = "stylesheet";
    stylesheet1.href = "\"" + metadata.host + "/resources/remix/clean-slate.min.css\"";
    document.head.appendChild(stylesheet1);

    var stylesheet2 = document.createElement("link");
    stylesheet2.rel = "stylesheet";
    stylesheet2.href = "\"" + metadata.host + metadata.host + "/resources/remix/style.css\"";
    document.head.appendChild(stylesheet2);
  }

  function grep(items, callback) {
    var filtered = [], len = items.length, i = 0;
    for (i; i < len; i++) {
      var item = items[i];
      var cond = callback(item);
      if (cond) {
        filtered.push(item);
      }
    }
    return filtered;
  }

  function getMetadata() {
    var metadata = {};
    var metaTags = document.getElementsByTagName("meta");

    grep(metaTags, function(metaTag) {
      return /^data-remix-.+/.test((metaTag).getAttribute("name"));
    })
    .forEach(function(metaTag) {
      var key = metaTag.getAttribute("name").replace(/^data-remix-/, "");

      // We see if a value for the current attribute already exists.
      // If it does, that means that we already encountered a meta tag
      // with that name which will refer to a more recent value than the
      // current one (we add the most recent values above all other values in
      // the <head> tag's contents).
      metadata[key] = metadata[key] || metaTag.getAttribute("content");
    });

    return metadata;
  }

  function run() {
    document.addEventListener("DOMContentLoaded", function() {
      var metadata = getMetadata();
      injectAnalytics();
      injectStyleSheets(metadata);
      injectDetailsBar(metadata, setupBar);
    });
  }

  run();  

}(document, document.head));
