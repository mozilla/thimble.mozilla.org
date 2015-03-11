define(["jquery", "/external/make-api.js", "/external/requestAnimationFrameShim.js"], function($, Make, requestAnimationFrameShim) {

  return {
    load: function(publishedUrl, endpoint, editor) {
      var make = Make({
        apiURL: endpoint
      });

      make.url(publishedUrl).then(function(err, results) {
        if (err || results.length === 0) {
          return;
        }

        var tutorialBtn = $(".tutorial-btn"),
            tutorialList = $(".tutorial-list"),
            iframe = $(".tutorial-iframe"),
            resizeButton = $(".tutorial-resize-button"),
            closeButton = $(".tutorial-close-button"),
            showButton = $(".tutorial-show-button"),
            urls = [],
            tag = "",
            prefix = "tutorial-",
            prefixOffset = prefix.length,
            taglist = results[0].tags;

        for (var i = 0, last = taglist.length; i < last; i++) {
          tag = taglist[i];
          if (tag.indexOf(prefix) === 0) {
            urls.push(decodeURIComponent(tag.substring(prefixOffset)));
          }
        }

        if (urls.length === 0) {
          return;
        } else {
          urls.forEach(function(url, index) {
            make.url(url).then(function(err, results) {
              if (err) {
                return;
              }

              var tutorial = {};

              if (results.length === 0) {
                tutorial.url = url;
                tutorial.title = url;
              } else {
                tutorial.url = results[0].url + "?details=hidden";
                tutorial.title = results[0].title || results[0].url;
              }

              var item = $("<div class='tutorial-list-item'></div>")
                            .text(tutorial.title)
                            .attr({
                              "data-title": tutorial.title,
                              "data-url": tutorial.url
                            })
                            .appendTo(tutorialList);

              if (index === 0) {
                item.click();
              }
            });
          });
        }

        function smartlines(data, source) {
          var codeMirror = editor.panes.codeMirror,
              lineFrom,
              lineTo,
              lineString,
              i;

          if (data.lines) {
            lineFrom = data.lines.from - 1;
            lineTo = data.lines.to ? data.lines.to - 1 : lineFrom;

            if (lineFrom > lineTo) {
              lineFrom = lineTo;
              lineTo = data.lines.from - 1;
            }

            if (lineFrom === lineTo) {
              lineString = "line " + (lineFrom+1);
            } else {
              lineString = "lines " + (lineFrom+1) + " - " + (lineTo+1);
            }
          }

          if (data.action === "init") {
            codeMirror.on("change", function(instance, obj){
              if ((obj && obj.removed && obj.text) && (obj.removed.length !== obj.text.length)) {
                var message = {
                  type: "tutorial",
                  action: "update",
                  obj: obj
                };
                source.postMessage(JSON.stringify(message), "*");
              }
            });
          } else if (lineTo < 0 || lineFrom > codeMirror.lastLine()){
            return;
          } else if (data.action === "highlight") {
            var top = codeMirror.getScrollInfo().top,
                clientHeight = codeMirror.getScrollInfo().clientHeight;

            // These methods call stubs for code mirror's functions and add a callback to add
            // asynchronicity due to communication with the Bracket's iframe which is where
            // the real code mirror instance lies
            codeMirror.lineAtHeight(top + 10, "local", function(viewportTop) {
              codeMirror.lineAtHeight(top + clientHeight, "local", function(viewportBottom) {
                if (lineTo < viewportTop) {
                  $(".tutorial-pointer").text(lineString).show();
                } else if (lineFrom > viewportBottom) {
                  $(".tutorial-pointer").text(lineString).addClass("down").show();
                }

                // This is done isntead of creating a span DOM element and sending it through
                // postMessage because JSON cannot parse circular references in DOM elements.
                // Refer to the quick fix in brackets-browser-livedev/main.js
                var highlight = function(position) {
                  var mark = {
                    name: "span",
                    attributes: {
                      "class": "gutter-mark tutorial-class"
                    },
                    innerHTML: "..."
                  };

                  codeMirror.setGutterMarker(position, "gutter-markers", mark, function() {
                    codeMirror.addLineClass(position, "background", "tutorial-highlight", function() {});
                  });
                };

                for (i = lineFrom; i <= lineTo; i++) {
                  highlight(i);
                }
              });
            });
          } else if (data.action === "unhighlight") {
            $(".tutorial-pointer").hide().removeClass("down");

            var removeHighlight = function(position) {
              codeMirror.setGutterMarker(position, "gutter-markers", null, function() {
                codeMirror.removeLineClass(position, "background", "tutorial-highlight", function() {});
              });
            };

            for (i = lineFrom; i <= lineTo; i++) {
              removeHighlight(i);
            }
          } else if (data.action === "scroll") {
            var position = codeMirror.getScrollInfo().top,
                distance,
                stepSize,
                steps = 0;

            $(".tutorial-pointer").fadeOut(function(){
              $(this).removeClass("down");
            });

            codeMirror.getLineHeight(".CodeMirror-code > div", function(lineHeight) {
              var margin = 5 * lineHeight; // how many lines are displayed above targetted line

              codeMirror.heightAtLine(lineFrom, "local", function(target) {
                target -= margin;

                if (target < 0) {
                  target = 0;
                }

                distance = Math.abs(target - position);
                if (distance < 0.1) {
                  return;
                }

                stepSize = Math.floor(distance/50 + 1); // greater distance -> greater step size, linear from 1 to 20 px
                if (stepSize > 20) {
                  stepSize = 20;
                }

                var scroll = (function(direction) {
                  return function() {
                    steps = steps + 1;
                    position = position + (direction * stepSize);
                    codeMirror.scrollTo(0, position);

                    if (steps * stepSize >= distance) {
                      codeMirror.scrollTo(0, target);
                      return;
                    }

                    requestAnimationFrame(scroll);
                  };
                }(target - position < 0 ? -1 : 1));

                scroll();
              });
            });
          }
        }

        function loadTutorialHandlers() {
          $("body").addClass("tutorial");
          $("#webmaker-source-code-pane").append('<div class="tutorial-pointer"></div>');

          tutorialList.on("click", ".tutorial-list-item", function(event) {
            event.stopPropagation();
            var url = $(this).attr("data-url");
            iframe.css("opacity", 0).attr("src", url).delay(1000).fadeTo(1200, 1);
            tutorialBtn
              .removeClass("open")
              .find(".tutorial-list-item").removeClass("active");
            $(this).addClass("active");
          });

          tutorialBtn.click(function() {
            $(this).toggleClass("open");
          });

          closeButton.click(function() {
            $("body").removeClass("tutorial");
            tutorialBtn.removeClass("open");
          });

          resizeButton.click(function(){
            $("body").toggleClass('tutorial-large');
            $(".icon-resize-full, .icon-resize-small").toggleClass("icon-resize-full icon-resize-small");
          });

          showButton.click(function() {
            $("body").addClass("tutorial");
          }).show();

          window.addEventListener('message', function(event){
            var data;

            try {
              data = JSON.parse(event.data);
              if(data.type && data.type === "tutorial" && !data.action) {
                console.error("tutorial payload had no associated instruction type", event.data);
              }
            }
            catch (e) {
              console.error("JSON.parse failed for tutorial payload", event.data);
            }

            if (!!window.postMessage) {
              smartlines(data, event.source);
            }
          });
        }

        loadTutorialHandlers();
      });
    }
  };
});
