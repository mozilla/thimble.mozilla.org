"use strict";

define([
  'jquery-slowparse',
  'i18n!./nls/base',
  'i18n!./nls/forbidjs'
], function($, base, forbidjs) {
  function addI18nBundleToErrorTemplates(bundle) {
    Object.keys(bundle).forEach(function(key) {
      var div = $('<div></div>').html(bundle[key])
        .addClass("error-msg").addClass(key);
      $.errorTemplates = $.errorTemplates.add(div);
    });
  }
  
  [base, forbidjs].forEach(addI18nBundleToErrorTemplates);
});
