/*********************************************************************
  tutorial.js
  jquery plugin to make your thimble tutorials smarter

  include this script in your tutorial make for
    * pagination of an element's children (default: true)
    * lines that highlight and scroll thimble editor (default: true)
    * targeting a subset of children with a selector (optional)

  $(selector).tutorial({
    paginate: boolean,
    smartlines: boolean,
    target: string
  });
*********************************************************************/

$.fn.tutorial = function(options){
  var settings = $.extend({
    paginate: true,
    smartlines: true
  }, options);

  var sections = this.children();
  if (settings.target) {
    sections = sections.filter(settings.target);
  }

  var max = sections.length;
  if (max === 0) {
    return;
  }

  if (settings.paginate === true) {
    var current = 1;
    var navCode = '<nav class="tutorial-nav">' +
                  '<span class="buttons">' +
                  '<button class="previous disabled" href="#">◄</button>' +
                  '<button class="next" href="#">►</button>' +
                  '</span>' +
                  '<span class="steps"><span class="current">1</span> / ' +
                  '<span class="max">1</span></span>' +
                  '</nav>';

    this.append(navCode);

    var step = function(e) {
      e.preventDefault();

      if ($(this).hasClass('disabled')) {
         return;
      }

      $('button').removeClass('disabled');

      var amount = parseInt(e.data.amount, 10);
      current = current + amount;

      if (current <= 1) {
        current = 1;
        $('.previous').addClass('disabled');
      }

      if (current >= max) {
        current = max;
        $('.next').addClass('disabled');
      }

      sections.hide();
      sections.eq(current - 1).show();

      // ensure we're scrolled all the way up
      scrollTo(0,0);

      $('.current').text(current);
    };

    sections.hide();
    sections.eq(current - 1).show();
    $('.current', this).text(current);
    $('.max', this).text(max);
    $('.next', this).click({amount: 1}, step);
    $('.previous', this).click({amount: -1}, step);
  }

  if (settings.smartlines === true) {
    var updateLines = function(data) {
      var from = data.obj.from.line,
          textLength = data.obj.text.length,
          removed = data.obj.removed.length,
          change = textLength - removed;

      if (change !== 0) {
        $('.tutorial-line > [data-line]').each(function(){
            var line = parseInt($(this).attr('data-line'), 10) - 1;
            if (line > from) {
              line = line + change;
              $(this)
                .attr('data-line', parseInt(line + 1, 10))
                .text(parseInt(line + 1, 10));
            }
        });
      }
    };

    // mark up any mentions of lines
    var re = /(lines?\s*)([0-9]+)(\s*-\s*|\s*to\s*)?([0-9]+)?/ig,
        value = '<span class="tutorial-line" data-line="$2">$1' +
                '<span data-line="$2" class="line-from">$2</span>$3' +
                '<span data-line="$4" class="line-to">$4</span>' +
                '</span>';

    sections
      .each(function(){
        $(this).html($(this).html().replace(re, value));
      });

    // add postmessage event handlers
    if (!!window.postMessage) {
      top.postMessage(JSON.stringify({
        type: "tutorial",
        action: "init"
      }), '*');

      var generateEventHandler = function(action){
        return function() {
          var lines = {
                from: parseInt($(this).find(".line-from").attr('data-line'), 10),
                to: parseInt($(this).find(".line-to").attr('data-line'), 10)
              },
              message = JSON.stringify({
                type: "tutorial",
                action: action,
                lines: lines
              });
          top.postMessage(message, '*');
        };
      };

      $('.tutorial-line', this)
        .mouseover(generateEventHandler("highlight"))
        .mouseout(generateEventHandler("unhighlight"))
        .click(generateEventHandler("scroll"));

      window.addEventListener('message', function(event) {
        try {
          data = JSON.parse(event.data);
          if(data.type && data.type === "tutorial" && !data.action) {
            console.error("tutorial payload had no valid action", event.data);
          }
        }
        catch (e) {
          console.error("JSON.parse failed for tutorial payload", event.data);
        }

        updateLines(data);
      });
    }
  }
};
