/**
 * Thimble Remix and Analytics injection, automatically
 * added to published projects.
 */
(function(document, head) {

  var gaTrackingId = 'UA-68630113-1';

  function injectAnalytics() {
    var analytics = document.createElement("script");
    analytics.textContent = '(function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){\n' + '(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n' + 'm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n' + '})(window,document,\'script\',\'//www.google-analytics.com/analytics.js\',\'ga\');\n' + 'ga(\'create\', \'' + gaTrackingId + '\', \'auto\');\n' + 'ga(\'send\', \'pageview\');\n';
    head.appendChild(analytics);
  }

  function setupBar(err) {
    if (err) {
      console.log("[Thimble Error] Unable to inject Remix UI. Error was: `" + err + "`");
      return;
    }

    var detailsBar = document.querySelector(".details-bar");
    
    if (detailsBar) {
      detailsBar.setAttribute("style", "");
      detailsBar.classList.add("mouse-mode");

      detailsBar.addEventListener("click", function(event) {
        if (event.target.classList.contains("thimble-button")) {
          detailsBar.classList.remove("collapsed");
          event.stopPropagation();
        }
      });

      detailsBar.addEventListener("click", function(event) {
        if (event.target.classList.contains("close-details-bar")) {
          detailsBar.classList.add("collapsed");
          event.stopPropagation();
        }
      });

      document.querySelector(".mouse-mode").addEventListener("mouseenter", function(){
        detailsBar.classList.remove("collapsed");
      });

      document.querySelector(".mouse-mode").addEventListener("mouseleave", function(){
        detailsBar.classList.add("collapsed");
      });
    }
  }

  function injectDetailsBar(metadata, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.responseType = "text";
    var url = metadata.host + "/projects/remix-bar";
    var data = {
      host: metadata.host,
      id: metadata.projectId,
      title: metadata.projectTitle,
      author: metadata.projectAuthor,
      updated: metadata.dateUpdated
    };

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === XMLHttpRequest.DONE ) {
        var response = xmlhttp.response;
        var textStatus = xmlhttp.statusText;
        if (xmlhttp.status === 200) {
          var fragmentBody = document.createElement("body");
          var docFragment = document.createDocumentFragment();
          docFragment.appendChild(fragmentBody);
          fragmentBody.innerHTML = response;
          var remixBar = fragmentBody.querySelector("div");
          document.body.appendChild(remixBar);
          callback(null);
        } else if (xmlhttp.status >= 400) {
          callback(textStatus);
        }
      }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send(data);
  }

  function injectStyleSheets(metadata) {
    var stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = metadata.host + "/resources/remix/clean-slate.min.css";
    document.head.appendChild(stylesheet);

    stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = metadata.host + "/resources/remix/style.css";
    document.head.appendChild(stylesheet);
  }

  var hasDataRemixAttribute = function(element) {
    var name = element.getAttribute("name");
    if (!name) {
      return false;
    }
    return name.startsWith("data-remix-");
  };

  function getMetadata() {
    var metadata = {};
    var metaElements = document.getElementsByTagName("meta");
    var remixElements = Array.from(metaElements).filter(hasDataRemixAttribute);

    remixElements.forEach(function(metaElement) {
      var key = metaElement.getAttribute("name").replace("data-remix-", "");

      // We see if a value for the current attribute already exists.
      // If it does, that means that we already encountered a meta tag
      // with that name which will refer to a more recent value than the
      // current one (we add the most recent values above all other values in
      // the <head> tag's contents).
      metadata[key] = metadata[key] || metaElement.getAttribute("content");
    });

    return metadata;
  }

  document.addEventListener("DOMContentLoaded", function() {
    var metadata = getMetadata();
    injectAnalytics();
    injectStyleSheets(metadata);
    injectDetailsBar(metadata, setupBar);
  });

}(document, document.head));
