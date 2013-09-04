"use strict";

define(function (require) {
  var $ = require("jquery"),
      BackboneEvents = require("backbone-events"),
      SocialMedia = require("./social-media"),
      DetailsForm = require('./details-form'),
      Make = require('/external/make-api.js'),
      ConfirmDialogTemplate = require("template!confirm-dialog"),
      PublishDialogTemplate = require("template!publish-dialog"),
      Localized = require("localized");
  
  function makeSharingHotLoader(options) {
    return function hotLoadEventHandler() {
      var socialMedia = options.socialMedia,
          urlToShare = options.urlToShare;
      $("li[data-medium]", this).each(function() {
        var element = $(this),
            medium = element.attr("data-medium");
        if (!element.hasClass("hotloaded") && socialMedia[medium]) {
          socialMedia.hotLoad(element[0], socialMedia[medium], urlToShare);
          element.addClass("hotloaded");
        }
      });
    };
  }

  return function(options) {
    var modals = options.modals,
        confirmDialog = $(ConfirmDialogTemplate()),
        publishDialog = $(PublishDialogTemplate()),
        dialogs = confirmDialog.add(publishDialog),
        codeMirror = options.codeMirror,
        publisher = options.publisher,
        baseRemixURL = options.remixURLTemplate,
        shareResult = $(".share-result", publishDialog),
        viewLink = $("a.view", publishDialog),
        remixLink = $("a.remix", publishDialog),
        accordions = $("div.accordion", publishDialog),
        origShareHTML = $(".thimble-additionals", shareResult).html(),
        currURL = null,
        socialMedia = SocialMedia(),
        detailsForm,
        makeData;

    modals.add(dialogs);

    // Add accordion behaviour to the publication dialog.
    accordions.click(function() {
      accordions.addClass("collapsed");
      $(this).removeClass("collapsed");
    });

    // If the user's code has errors, warn them before publishing.
    codeMirror.on("reparse", function(event) {
      var hasErrors = event.error ? true : false;
      confirmDialog.toggleClass("has-errors", hasErrors);
    });

    // Search for the make, and apply details to metadata form
    var makeEndpoint = $('body').data('make-endpoint');
    var makeUrl = $('body').data('make-url');
    if ( makeUrl ) {
      var make = Make({ apiURL: makeEndpoint });
      make.find({
        url: makeUrl
      }).then(function(err, data) {
        makeData = data[0];
      });
    }
    var performPublish = function(){
      // Reset the publish modal.
      shareResult.unbind('.hotLoad');
      $(".accordion", publishDialog).addClass("collapsed");
      $(".publication-result", publishDialog).removeClass("collapsed");
      $(".thimble-additionals", shareResult).html(origShareHTML);
      publishDialog.addClass("is-publishing");

      // Start the actual publishing process, so that hopefully by the
      // time the transition has finished, the user's page is published.
      var code = codeMirror.getValue(),
          publishErrorOccurred = false;
      publisher.saveCode({
        html: code,
        metaData: detailsForm.getValue()
      }, currURL, function(err, info) {
        if (err) {
          publishDialog.stop().hide();
          modals.showErrorDialog({
            text: Localized.get('publish-err') + " " + err.responseText
          });
          publishErrorOccurred = true;
        } else {
          var viewURL = info.url;
          var remixURL = baseRemixURL.replace("{{VIEW_URL}}",
                                              escape(info.path));
          viewLink.attr('href', viewURL).text(viewURL);
          remixLink.attr('href', remixURL).text(remixURL);

          shareResult.bind('click.hotLoad', makeSharingHotLoader({
            urlToShare: viewURL,
            socialMedia: socialMedia
          }));

          // If the user has selected the sharing accordion while
          // we were publishing, hot-load the sharing UI immediately.
          if (!shareResult.hasClass("collapsed"))
            shareResult.click();

          // The user is now effectively remixing the page they just
          // published.
          currURL = viewURL;

          publishDialog.removeClass("is-publishing");
          self.trigger("publish", {
            viewURL: viewURL,
            remixURL: remixURL,
            path: info.path
          });
        }
      });

      // We want the dialogs to transition while the page-sized translucent
      // overlay stays in place. Because each dialog has its own overlay,
      // however, this is a bit tricky. Eventually we might want to move
      // to a DOM structure where each modal dialog shares the same overlay.
      $(".thimble-modal-menu", confirmDialog).fadeOut(function() {
        $(this).show();
        confirmDialog.hide();
        if (!publishErrorOccurred) {
          publishDialog.show();
          $(".thimble-modal-menu", publishDialog).hide().fadeIn();
        }
      });
    };

    $(".yes-button", confirmDialog).click(performPublish);

    var self = {
      setCurrentURL: function(url) {
        currURL = url;
      },
      start: function(publishButton) {
        var bounds = publishButton.getBoundingClientRect();
        var dialogBoxes = $('.thimble-modal-menu', dialogs);
        dialogBoxes.css({
          top: bounds.bottom + 'px',
          left: (bounds.right - dialogBoxes.width()) + 'px'
        });
        if (!detailsForm) {
          detailsForm = new DetailsForm({
            container: '.details-container',
            codeMirror: codeMirror
          });
          detailsForm.updateAll(makeData);
        } else {
          detailsForm.updateAll();
        }

        confirmDialog.fadeIn();
      }
    };

    BackboneEvents.mixin(self);
    return self;
  };
});
