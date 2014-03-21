/**
 * Object for resolving urls in source code, so that HTTP resources on an
 * HTTPS site end up rewritten to an HTTPS proxy URL instead.
 */
define(function() {

  /**
   * record a to-proxy URL in an HTML section
   */
  function processHTMLMixedContent(sourceCode, warning, urls) {
    var parseInfo = warning.parseInfo,
        attribute = parseInfo.attribute,
        value = attribute.value,
        start = value.start,
        end = value.end,
        url = sourceCode.substring(start, end);
    urls.push({
      start: start,
      end: end,
      url: url
    });
  }

  /**
   * record a to-proxy URL in a CSS section
   */
  function processCSSMixedContent(sourceCode, warning, urls) {
    var parseInfo = warning.parseInfo,
        value = parseInfo.cssValue,
        start = value.start,
        end = value.end,
        urlField = sourceCode.substring(start, end),
        match = urlField.match(/url\(['"]?([^'")]+)['"]?\)/),
       url = match ? match[1] : false;
    if (url) {
      start += urlField.indexOf(url);
      end = start + url.length;
      urls.push({
        start: start,
        end: end,
        url: url
      });
    }
  }

  /**
   * Replace to-proxy URLs in source code with the proper proxy URL
   */
  var performURLSurgery = (function() {
    var knownURLs = {},
        knownURLCacheSize = 1000;

    // "all urls checked" handler
    var finalize = function(sourceCode, intervals, batch, whenProxyResolves) {
      if (Object.keys(batch).length === intervals.length) {
        // ensure reversed sort order, so that we resolve last-url-first
        intervals.sort(function(a,b) {
          return b.start - a.start;
        });
        // add this batch to the known URL set
        Object.keys(batch).forEach(function(url) {
          knownURLs[url] = batch[url];
        });
        // perform sourceCode url replacements
        intervals.forEach(function(interval) {
          var start = interval.start;
          var end = interval.end;
          var url = interval.url;
          sourceCode = sourceCode.substring(0,start) + knownURLs[url] + sourceCode.substring(end);
        });
        // done!
        if(whenProxyResolves) {
          whenProxyResolves(sourceCode);
        }
      }
    };

    return function performURLSurgery(sourceCode, warnings, intervals, whenProxyResolves) {
      // A very aggressive cache policy for proxy URLs:
      // if we've cached more than is memory-reasonable,
      // just wipe all of them and start filling back up.
      if (Object.keys(knownURLs).length > knownURLCacheSize) {
        knownURLs = {};
      }

      var batch = {};

      // Run through all the warnings and resolve the proxy URLS, for
      // any URL that we have not previously proxied during this session.
      intervals.forEach(function(interval) {
        var url = interval.url;
        if (knownURLs[url]) { batch[url] = knownURLs[url]; }
        else {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", "/getproxyurl?url=" + encodeURIComponent(url), true);
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
              // successful proxy URL request
              if (xhr.status === 200) {
                var response = xhr.responseText;
                try {
                  var result = JSON.parse(response);
                  batch[url] = result.url;
                }
                catch (e) {
                  console.error("An error occurred while resolving the proxy URL for " + url + " (response was not valid JSON)");
                  batch[url] = url;
                }
              }
              // proxy URL failure
              if (xhr.status === 500) {
                console.error("An error occurred while resolving the proxy URL for " + url + " (respone was HTTP 500)");
                batch[url] = url;
              }
              // check to see if we're done, which may call the passed handler.
              finalize(sourceCode, intervals, batch, whenProxyResolves);
            }
          };
          xhr.send(null);
        }
      });

      // If we already know all proxy URLs, we will not have called
      // finalize at any point in the preceding code, so call it now:
      finalize(sourceCode, intervals, batch, whenProxyResolves);
    };
  }());

  /**
   * handle (possible) warnings - these do not necessarily
   * lead to a "bad" make.
   */
  function handleWarnings(sourceCode, warnings, whenProxyResolves) {
    if (!warnings) return whenProxyResolves(sourceCode);

    // aggregate the to-be-resolved URLs in reverse order,
    // we so can run through all the relevant ones and
    // update the sourceCode string back-to-front (i.e. in
    // a way that doesn't invalidate start/end markers)
    var urls = [];
    warnings.reverse().forEach(function(warning) {
      if (warning.message === "HTTP_LINK_FROM_HTTPS_PAGE") {
        processHTMLMixedContent(sourceCode, warning, urls);
      }
      else if (warning.message === "CSS_MIXED_ACTIVECONTENT") {
        processCSSMixedContent(sourceCode, warning, urls);
      }
    });

    // Update the sourceCode string, through a callback.
    // If we don't know a URL's proxy URL yet, we first request
    // it from our dedicated proxy url resolution route in thimble.
    // NOTE: we only cache the url, not the proxied resource!
    performURLSurgery(sourceCode, warnings, urls, whenProxyResolves);
  }

  // return object for handling warnings
  return {
    proxyURLs: handleWarnings
  };
});
