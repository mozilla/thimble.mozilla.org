define(['template!details-form'], function (detailsFormHTML) {
  var DEFAULT_THUMBNAIL = 'https://webmaker.org/img/thumbs/thimble-grey.png';
  var ALL_FIELDS = [
    'title',
    'thumbnail',
    'description',
    'tags'
  ];

  var $container;
  var $thumbnailChoices;
  var codeMirror;

  // selector function for returning a form element
  function $input(name) {
    return $('[name="' + name + '"]', $container);
  }

  // Validation function that asks Thimble whether
  // a particular title has already been saved before
  // by the currently logged-in user.
  function validateTitle() {
    var $this = $(this),
        $error = $(".title-error.error-message"),
        $button = $(".confirmation-button.yes-button"),
        title = this.value.toLowerCase(),
        csrf_token = $("meta[name='X-CSRF-Token']").attr("content");

    $.ajax({
      type: "POST",
      url: "/checktitle",
      data: {
        'title': title,
        'pageOperation': $("meta[name='thimble-operation']").attr("content"),
        'origin': $("meta[name='thimble-project-origin']").attr("content")
      },
      dataType: 'json',
      beforeSend: function(request) {
        request.setRequestHeader('X-CSRF-Token', csrf_token);
      },
      error: function(req) {
        console.log("error while validating the title of your page")
      },
      success: function(response) {
        if(response.status !== 200) {
          $error.show();
          $button.hide();
        } else {
          $error.hide();
          $button.show();
        }
      }
    });
  };

  var DetailsForm = function (options) {
    var self = this;
    var defaults = {
      container: '.publish-panel',
      documentIframe: '.preview-holder iframe'
    };

    for (option in options) {
      defaults[option] = options[option] || defaults[option];
    }

    options = defaults;

    $container = $(options.container);
    $container.html(detailsFormHTML());

    codeMirror = options.codeMirror;
    $thumbnailChoices = $('.thumbnail-choices', $container);


    // Setup
    $input('tag-input').on('keydown', function (e) {
      if (e.which === 13 || e.which === 188) {
        e.preventDefault();
        // FIXME: https://bugzilla.mozilla.org/show_bug.cgi?id=922724
        // We encode user input tags because
        // currently tags with colons are stripped.
        // Tutorial urls contain a colon,
        // so in order to not have it stripped, we escape it.
        self.addTags(encodeURIComponent(this.value));
      }
    });
    $input('tag-input').on('blur', function (e) {
      self.addTags(encodeURIComponent(this.value));
    });
    $input('tag-output').click(function (e) {
      if (e.target.tagName === 'LI') {
        var $target = $(e.target);
        var tag = $target.text();
        // Remove from tags array
        var i = self.tags.indexOf(tag);
        self.tags.splice(i, 1);
        $input('tags').val(self.tags.join(','));
        // Remove element
        $target.remove();
      }
    });
    $input('thumbnail').on('blur', function (e) {
      self.updateThumbnails(this.value);
    });

    // Store tags
    self.tags = [];

    // bind change listener for the title
    $input('title').on('input', validateTitle);
  };

  DetailsForm.prototype.getCodeMirrorValue = function() {
    var self = this;
    return $('<div></div>').html(codeMirror.getValue());
  };

  // Update thumbnail choices based on contents of documentIframe
  DetailsForm.prototype.updateThumbnails = function (selectedImg) {
    var self = this;
    var $currentHTML = self.getCodeMirrorValue();
    var imgs = [];

    // First add selected image, if it exists
    if (selectedImg) {
      imgs.push(selectedImg);
    }

    // Now find images from the document HTML
    var imgsFromDocument = $currentHTML.find('img').each(function (i, el) {
      if (el.src && imgs.indexOf(el.src) === -1) {
        imgs.push(el.src);
      }
    });
    // Finally, add the default thumbnail
    if (imgs.indexOf(DEFAULT_THUMBNAIL) === -1) {
      imgs.push(DEFAULT_THUMBNAIL);
    }

    $thumbnailChoices.empty();

    imgs.forEach(function (src, i) {
      var $img = $('<li></li>');
      $img.css('background-image', 'url(' + src + ')');
      $thumbnailChoices.append($img);
      $img.click(function () {
        $thumbnailChoices.find('.selected').removeClass('selected');
        $(this).addClass('selected');
        $input('thumbnail').val(src);
      });
      // Use first image as thumbnail by default
      if (i === 0) {
        $input('thumbnail').val(src);
        $img.addClass('selected');
      }
    });

  };

  // Find meta tags in HTML content. Returns an array of strings;
  DetailsForm.prototype.findMetaTagInfo = function (name) {
    var self = this;
    // Different syntax for author and description
    if (name !== 'description' & name !== 'author') {
      name = 'webmaker:' + name;
    }

    var $currentHTML = self.getCodeMirrorValue();
    var $tags = $currentHTML.find('meta[name="' + name + '"]');

    var content = [];

    $tags.each(function (i, el) {
      content.push(el.content);
    });

    return content;
  }

  DetailsForm.prototype.addTags = function (tags) {
    var self = this;
    if (!tags) {
      return;
    }
    if (typeof tags === 'string') {
      tags = tags.split(',');
    }
    tags.forEach(function (item) {
      var val = item.replace(/[,#\s]/g, '');
      if (val && self.tags.indexOf(val) === -1 && val.indexOf( ":" ) === -1 ) {
        self.tags.push(val);
        $input('tags').val(self.tags.join(','));
        // FIXME: https://bugzilla.mozilla.org/show_bug.cgi?id=922724
        // We decode any tags for now because
        // currently tags with colons are stripped.
        // So when we save a tag, we escape colons, so when we try to display it, unescape it.
        $input('tag-output').append('<li>' + decodeURIComponent( val ) + '</li>');
      }
    });
    $input('tag-input').val('');
  };

  // Update a given field
  DetailsForm.prototype.setValue = function (field, val) {
    var self = this;
    var $fieldInput = $input(field);
    var currentVal = $fieldInput.val();

    switch (field) {
      case 'title':
        val = val || currentVal || self.getCodeMirrorValue().find('title').text();
        $fieldInput.val(val);
        // validate this title against Thimble's known titles for this user
        validateTitle.call($fieldInput[0]);
        break;
      case 'thumbnail':
        val = val || currentVal || self.findMetaTagInfo('thumbnail')[0];
        self.updateThumbnails(val);
        break;
      case 'tags':
        val = val || currentVal || self.findMetaTagInfo('tags');
        // FIXME: https://bugzilla.mozilla.org/show_bug.cgi?id=922724
        // We do not decode tags directly from the makeapi,
        // this means it was stored with a colon, and is created outside of thimble.
        self.addTags(val);
        break;
      default:
        val = val || currentVal || self.findMetaTagInfo(field)[0];
        $fieldInput.val(val);
        break;
    }
  };

  // Update all fields with an object of make data
  DetailsForm.prototype.updateAll = function (data) {
    var self = this;
    data = data || {};
    var self = this;
    ALL_FIELDS.forEach(function (field, i) {
      self.setValue(field, data[field]);
    });
  };

  // Return data for a field, or an object containing all metadata
  DetailsForm.prototype.getValue = function (field) {
    var self = this;
    var fields = field ? [field] : ALL_FIELDS;
    var obj = {};

    fields.forEach(function (item) {
      var val = $input(item).val();
      obj[item] = val;
    });

    return obj;
  };

  return DetailsForm;
});
