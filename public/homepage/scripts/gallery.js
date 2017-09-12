/* globals $: true */

var $ = require("jquery");
var strings = require("strings");

var analytics = require("../../shared/scripts/analytics");

module.exports = {
  searchSpeedMS: 500, // How long do we wait after a user types before searching
  typeInterval: false, // Keeps track of if a user is typing
  mode: "featured", // "featured" or "search", affects the layout
  searchTags: [], // The selected tags that we're filtering with
  searchTerms: [], // Search terms from the input
  maxDisplayTags: 5, // Max number of tags to show above results
  resultsTimeoutMS: 200, // Visual delay for displaying updated results & tags
  lastSearchString: false,

  // Fetch external activity data
  init: function() {
    this.galleryEl = $(".gallery");

    if (this.galleryEl.length === 0) {
      return;
    }

    var that = this;
    var URL =
      "https://mozilla.github.io/thimble-homepage-gallery/activities.json";
    $.get(URL)
      .done(function(returnedData) {
        that.startGallery(returnedData);
      })
      .fail(function() {
        console.log("Unable to load gallery project data from " + URL);
        that.galleryEl.addClass("loading-error");
        that.galleryEl.find("input").attr("disabled", true);
      });
  },

  // Populate gallery and add UI event handlers
  startGallery: function(activities) {
    var that = this;
    this.galleryEl.on("focus", "input", function() {
      that.updateUI();
    });
    this.galleryEl.on("blur", "input", function() {
      that.updateUI();
    });

    this.galleryEl.on("click", ".clear", function() {
      that.clearSearch();
    });
    this.galleryEl.on("keydown", ".search", function(e) {
      that.keyPressed(e);
    });
    this.galleryEl.on("mousedown", ".tag", function() {
      that.tagClicked($(this).attr("tag"));
    });

    this.galleryEl.on("click", ".activity .view-project", function() {
      that.thumbnailClicked($(this));
    });
    this.galleryEl.on("click", ".activity .remix", function() {
      that.remixClicked($(this));
    });

    this.galleryEl.on("click", ".search-tags .remove", function() {
      that.removeTag($(this).parent());
    });
    this.galleryEl.on("click", ".start-over", function(e) {
      that.startOver(e);
    });

    this.activities = activities;
    this.filterActivities();

    setTimeout(function() {
      that.galleryEl.removeClass("loading");
    }, this.resultsTimeoutMS);
  },

  //When a Project preview gets clicked
  thumbnailClicked: function(el) {
    var title = el
      .closest(".activity")
      .find(".project-title")
      .text();
    analytics.event({
      category: analytics.eventCategories.HOMEPAGE,
      action: "Gallery Project Viewed",
      label: title
    });
  },

  //When a Project gets remixed
  remixClicked: function(el) {
    var title = el
      .closest(".activity")
      .find(".project-title")
      .text();
    analytics.event({
      category: analytics.eventCategories.HOMEPAGE,
      action: "Gallery Project Remixed",
      label: title
    });
  },

  // Removes one of the tags that is currently being used as a filter
  removeTag: function(tagEl) {
    var tagName = tagEl.attr("tag");
    var index = this.searchTags.indexOf(tagName);
    if (index > -1) {
      this.searchTags.splice(index, 1);
    }
    tagEl.remove();
    this.filterActivities();
    this.updateUI();
  },

  // Fires whenever someone types into the search field
  keyPressed: function(e) {
    clearTimeout(this.typeInterval);
    var that = this;

    // Removes the last-added search tag if a user presses backspace and
    // there is no search term
    if (this.galleryEl.find(".search").val().length === 0 && e.keyCode === 8) {
      var tagNum = this.galleryEl.find(".search-tags .search-tag").length;
      if (tagNum > 0) {
        this.removeTag(this.galleryEl.find(".search-tag:last-child"));
        return;
      }
    }

    this.typeInterval = setTimeout(function() {
      that.updateUI();
      that.filterActivities();
    }, that.searchSpeedMS);
  },

  // Determines which activities should be displayed
  filterActivities: function() {
    if (
      this.galleryEl.find("input").val().length > 0 ||
      this.searchTags.length > 0
    ) {
      this.mode = "search";
    } else {
      this.mode = "featured";
    }

    // If there is no search term, shows the featured activities only
    if (this.mode === "featured") {
      for (var i = 0; i < this.activities.length; i++) {
        var activity = this.activities[i];
        if (activity.featured) {
          activity.display = true;
        } else {
          activity.display = false;
        }
      }
    }

    // Checks for the search term in the title, description  and tags
    if (this.mode === "search") {
      this.searchTerms = this.galleryEl
        .find("input")
        .val()
        .toLowerCase()
        .split(" ");

      for (var i = 0; i < this.activities.length; i++) {
        var activity = this.activities[i];
        var searchString =
          activity.title +
          activity.description +
          activity.tags +
          activity.author;
        searchString = searchString.toLowerCase();

        activity.display = true;

        // Check for each of the selected tags...
        for (var j = 0; j < this.searchTags.length; j++) {
          var thisTerm = this.searchTags[j];
          if (searchString.indexOf(thisTerm) < 0) {
            activity.display = false;
          }
        }

        // Check for each of the search terms...
        for (var j = 0; j < this.searchTerms.length; j++) {
          var thisTerm = this.searchTerms[j];
          if (searchString.indexOf(thisTerm) < 0) {
            activity.display = false;
          }
        }
      }
    }

    // Send analytics event
    var searchQuery = this.searchTerms.join(" ");
    if (searchQuery.length > 0 && searchQuery != this.lastSearchString) {
      analytics.event({
        category: analytics.eventCategories.HOMEPAGE,
        action: "Keyword Search",
        label: searchQuery
      });
    }
    this.lastSearchString = searchQuery;

    this.galleryEl.find(".popular-tags, .activities").addClass("fade");
    this.updateUI();

    var that = this;

    setTimeout(function() {
      that.displayActivities(that.activities);
    }, this.resultsTimeoutMS);

    setTimeout(function() {
      that.galleryEl.find(".fade").removeClass("fade");
    }, this.resultsTimeoutMS * 2);
  },

  // Adds all of the items that are supposed to be shown to the page
  displayActivities: function(activities) {
    this.galleryEl.find(".activities *").remove();

    var resultCount = 0;

    for (var i = 0; i < activities.length; i++) {
      var activity = activities[i];

      if (activity.display) {
        resultCount++;
        var newItem = this.galleryEl.find(".activity-template").clone();
        newItem.removeClass("activity-template");
        newItem
          .find(".thumbnail")
          .css("background-image", "url(" + activity.thumbnail_url + ")");
        newItem.find(".view-project").attr("href", activity.url);
        newItem
          .find(".project-title")
          .text(activity.title)
          .attr("href", activity.url);
        newItem.find(".author a").text(activity.author);
        newItem.find(".author a").attr("href", activity.author_url);
        newItem.find(".description").text(activity.description);

        newItem
          .find(".remix")
          .attr("href", "/projects/" + activity.project_id + "/remix");
        if (activity.teaching_kit_url) {
          newItem
            .find(".teaching-kit")
            .attr("href", activity.teaching_kit_url)
            .removeClass("hidden");
        } else {
          newItem.find(".teaching-kit").addClass("hidden");
        }

        for (var j = 0; j < activity.tags.length; j++) {
          newItem
            .find(".tags")
            .append(
              "<a class='tag' tag='" +
                activity.tags[j] +
                "' title='See other projects tagged " +
                activity.tags[j] +
                "' >" +
                activity.tags[j] +
                "</a> "
            );
        }

        this.galleryEl.find(".activities").append(newItem);
      }
    }
  },

  // Displays the list of tags under the search bar
  displayTags: function(type) {
    this.galleryEl.find(".tag-list .tag").remove();

    var tags = {};

    for (var i = 0; i < this.activities.length; i++) {
      var activity = this.activities[i];
      if (type === "featured" || activity.display) {
        for (var j = 0; j < activity.tags.length; j++) {
          var tag = activity.tags[j];
          if (!tags[tag]) {
            tags[tag] = 1;
          } else {
            tags[tag]++;
          }
        }
      }
    }

    var tagsArray = [];

    for (var k in tags) {
      if (tags.hasOwnProperty(k)) {
        var push = false;
        for (var i = this.searchTags.length; i >= 0; i--) {
          if (this.searchTags.indexOf(k) < 0) {
            push = true;
          }
        }
        if (push) {
          tagsArray.push([k, tags[k]]);
        }
      }
    }

    tagsArray.sort(function(x, y) {
      return y[1] - x[1];
    });

    var maxTags = this.maxDisplayTags;

    if (maxTags > tagsArray.length) {
      maxTags = tagsArray.length;
    }

    for (var i = 0; i < maxTags; i++) {
      var tag = tagsArray[i];
      this.galleryEl
        .find(".tag-list")
        .append(
          "<a class='tag' tag='" +
            tag[0] +
            "' title='Search for projects tagged " +
            tag[0] +
            "'>" +
            tag[0] +
            " <span class='count'>" +
            tag[1] +
            "<span></a>"
        );
    }

    var tagsTitleEl = this.galleryEl.find(".popular-tags .tags-title");

    if (type === "featured") {
      tagsTitleEl.text(strings.get("popularTags"));
    } else {
      tagsTitleEl.text(strings.get("addFilter"));
    }

    if (maxTags > 0) {
      tagsTitleEl.show();
    } else {
      tagsTitleEl.hide();
    }
  },

  // Handles when a popular tag, or a tag on an activity is clicked
  tagClicked: function(term) {
    if (this.searchTags.indexOf(term) < 0) {
      this.galleryEl
        .find(".search-tags")
        .append(
          "<span tag='" +
            term +
            "'class='search-tag'>" +
            term +
            "<a class='remove'></a></span>"
        );
      this.searchTags.push(term);
      this.filterActivities();
    }

    this.galleryEl.find(".search-wrapper").addClass("pop");

    var that = this;
    setTimeout(function() {
      that.galleryEl.find(".search-wrapper").removeClass("pop");
    }, 200);

    analytics.event({
      category: analytics.eventCategories.HOMEPAGE,
      action: "Gallery Tag Clicked",
      label: term
    });
  },

  // Updates the tags & activities UI
  updateResultsUI: function() {
    var displaycount = 0;
    for (var i = 0; i < this.activities.length; i++) {
      var activity = this.activities[i];
      if (activity.display) {
        displaycount++;
      }
    }

    if (displaycount > 1) {
      this.galleryEl.find(".popular-tags").removeClass("hidden");
    } else {
      this.galleryEl.find(".popular-tags").addClass("hidden");
    }

    if (this.mode === "featured" || displaycount === 0) {
      this.displayTags("featured");
    } else {
      this.displayTags("search");
    }
  },

  // Updates the search and results title UI
  updateUI: function() {
    var displaycount = 0;

    for (var i = 0; i < this.activities.length; i++) {
      var activity = this.activities[i];
      if (activity.display) {
        displaycount++;
      }
    }

    if (displaycount === 0) {
      this.galleryEl.addClass("no-results-found");
    } else {
      this.galleryEl.removeClass("no-results-found");
    }

    if (this.mode === "search") {
      this.galleryEl.find(".title").text(strings.get("searchResultsTitle"));
    } else {
      this.galleryEl.find(".title").text(strings.get("remixGalleryTitle"));
    }

    var termLength = $(".search").val().length;
    if (termLength > 0) {
      this.galleryEl.addClass("has-term");
    } else {
      this.galleryEl.removeClass("has-term");
    }

    var active = false;

    if (termLength > 0) {
      active = true;
    }
    if (this.galleryEl.find("input").is(":focus")) {
      active = true;
    }
    if (this.searchTags.length > 0) {
      active = true;
    }

    if (active) {
      this.galleryEl.attr("active", true);
    } else {
      this.galleryEl.removeAttr("active");
    }

    var that = this;
    setTimeout(function() {
      that.updateResultsUI();
    }, this.resultsTimeoutMS);
  },

  // Resets the search field and tags
  startOver: function(e) {
    this.galleryEl.find(".search").val("");
    this.searchTags = [];
    this.searchTerms = [];
    this.galleryEl.find(".search-tags *").remove();
    this.filterActivities();
    e.preventDefault();
  },

  // Clears the search field
  clearSearch: function() {
    this.galleryEl.find(".search").val("");
    this.filterActivities();
    this.updateUI();
  }
};
