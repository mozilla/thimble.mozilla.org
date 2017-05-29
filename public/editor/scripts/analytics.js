// Based on https://github.com/mozilla/webmaker-analytics
// Licensed under the MPL 2.0 License: https://github.com/mozilla/webmaker-analytics/blob/master/LICENSE
/* global ga */

(function(global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  }
  else if (typeof module === "object" && module && typeof module.exports === "object") {
    module.exports = factory();
  } else {
    global.analytics = factory();
  }
}(this, function() {

  // Strings for event category names
  var eventCategories = {};
  eventCategories.EDITOR_UI = "Editor UI";
  eventCategories.HOMEPAGE = "Homepage";
  eventCategories.PROJECT_ACTIONS = "Project Actions";
  eventCategories.TROUBLESHOOTING = "Troubleshooting";

  var _redacted = "REDACTED (Potential Email Address)";

  /**
   * To Title Case 2.1 - http://individed.com/code/to-title-case/
   * Copyright 2008-2013 David Gouch. Licensed under the MIT License.
   * https://github.com/gouch/to-title-case
   */
  function toTitleCase(s){
    var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;
    s = trim(s);

    return s.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title){
      if (index > 0 &&
          index + match.length !== title.length &&
          match.search(smallWords) > -1 &&
          title.charAt(index - 2) !== ":" &&
          (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
          title.charAt(index - 1).search(/[^\s-]/) < 0) {
        return match.toLowerCase();
      }

      if (match.substr(1).search(/[A-Z]|\../) > -1) {
        return match;
      }

      return match.charAt(0).toUpperCase() + match.substr(1);
    });
  }

  // GA strings need to have leading/trailing whitespace trimmed, and not all
  // browsers have String.prototoype.trim().
  function trim(s) {
    return s.replace(/^\s+|\s+$/g, '');
  }

  // See if s could be an email address. We don't want to send personal data like email.
  function mightBeEmail(s) {
    // There's no point trying to validate rfc822 fully, just look for ...@...
    return (/[^@]+@[^@]+/).test(s);
  }

  function warn(msg) {
    console.warn("[analytics] " + msg);
  }

  // This receives the event action, then passes it on to sendEvent to send out
  function event(options) {
    options = options || {};

    var eventOptions = {};

    // Event Category
    eventOptions.category = options.category || "Uncategorized";

    // Event Action
    if(!options.action) {
      warn("Expected `action` arg.");
      return;
    }
    if(mightBeEmail(options.action)) {
      warn("`action` arg looks like an email address, redacting.");
      options.action = _redacted;
    }
    eventOptions.action = toTitleCase(options.action);

    // Event Label
    if(options.label) {
      if(typeof options.label !== "string") {
        warn("Expected `label` arg to be a String.");
      } else {
        if(mightBeEmail(options.label)) {
          warn("`label` arg looks like an email address, redacting.");
          options.label = _redacted;
        }
        eventOptions.label = trim(options.label);
      }
    }

    // Event Value
    if(options.value || options.value === 0) {
      if(typeof value !== "number") {
        warn("Expected `value` arg to be a Number.");
      } else {
        // Force value to int
        eventOptions.value = options.value|0;
      }
    }

    // noninteraction: An optional boolean that when set to true, indicates that
    // the event hit will not be used in bounce-rate calculation.
    if(options.nonInteraction) {
      if(typeof options.nonInteraction !== "boolean") {
        warn("Expected `noninteraction` arg to be a Boolean.");
      } else {
        eventOptions.nonInteraction = options.nonInteraction === true;
      }
    }

    sendEvent(eventOptions);
  }

  function sendEvent(options) {

    if(typeof ga === "function") {
      // Transform the argument array to match the expected call signature for ga(), see:
      // https://developers.google.com/analytics/devguides/collection/analyticsjs/events#overview

      // Required Event Field
      var fieldObject = {
        'hitType': 'event',
        'eventCategory': options.category,
        'eventAction': options.action
      };

      // Optional Event Fields
      if(options.label) {
        fieldObject['eventLabel'] = options.label;
      }
      if(options.label || options.label === 0) {
        fieldObject['eventValue'] = options.value;
      }
      if(options.nonInteraction === true) {
        fieldObject['nonInteraction'] = 1;
      }

      ga('send', fieldObject);
    }
  }

  // Use a consistent prefix and check if arg starts with a forward slash
  function prefixVirtualPageview(s) {
    // Bail if s is already prefixed.
    if(/^\/virtual\//.test(s)) {
      return s;
    }
    // Make sure s has a leading / then add prefix and return
    s = s.replace(/^[/]?/, '/');
    return '/virtual' + s;
  }

  function virtualPageview(virtualPagePath) {
    if(!virtualPagePath) {
      warn("Expected `virtualPagePath` arg.");
      return;
    }
    virtualPagePath = trim(virtualPagePath);

    var eventOptions = {};
    eventOptions.virtualPagePath = prefixVirtualPageview(virtualPagePath);

    sendVirtualPageView(eventOptions);
  }

  function sendVirtualPageView(options) {
    if(typeof ga === "function") {
      // Transform the argument array to match the expected call signature for ga():
      // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference
      var fieldObject = {
        'hitType': 'pageview',
        'page': options.virtualPagePath
      };
      ga('send', fieldObject);
    }
  }


  return {
    event: event,
    eventCategories: eventCategories,
    virtualPageview: virtualPageview
  };

}));
