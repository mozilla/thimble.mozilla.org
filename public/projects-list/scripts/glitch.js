/* globals $: true */

var $ = require("jquery");

module.exports = {
  init: function() {
    let cta = $(".glitch-cta.underlay"),
      content = $(".content", cta),
      close = $(".cta-close", content),
      start = $("button.export-button.start", content),
      exportPublished = $("button.export-button.published", content),
      exportUnpublished = $("button.export-button.unpublished", content),
      csrfToken = $("meta[name='csrf-token']").attr("content"),
      importURL = $("meta[name='glitch-url']").attr("content");

    function getToken(url, onSuccess, onError) {
      try {
        fetch(url, {
          method: "POST",
          headers: {
            "X-Csrf-Token": csrfToken
          }
        })
          .then(response => {
            if (response.status !== 200) {
              throw new Error("could not retrieve token");
            }
            return response.json();
          })
          .then(object => o.token)
          .then(token => onSuccess(token))
          .catch(e => onError(e));
      } catch (e) {
        onError(e);
      }
    }

    // We track the projectId "globally" for a dialog, because there
    // can only ever be one dialog open at a time, triggered for
    // one specific project to be exported.
    let projectId = -1;

    close.click(() => {
      cta.addClass("hidden");
      start.removeClass("hidden");
      exportPublished.addClass("hidden");
      exportUnpublished.addClass("hidden");
    });

    start.click(evt => {
      start.addClass("hidden");
      exportPublished.removeClass("hidden");
      exportUnpublished.removeClass("hidden");
    });

    exportPublished.click(evt => {
      let url = `/projects/${projectId}/export/start`;

      exportPublished.addClass("busy");
      getToken(
        url,
        token => {
          let args = `token=${token}&id=${projectId}&published=true`;
          window.location = `//${importURL}?${args}`;
        },
        e => console.error(e) // what should we do here?
      );
    });

    exportUnpublished.click(evt => {
      let url = `/publishedprojects/${projectId}/export/start`;

      exportUnpublished.addClass("busy");
      getToken(
        url,
        token => {
          let args = `token=${token}&id=${projectId}&published=false`;
          window.location = `//${importURL}?${args}`;
        },
        e => console.error(e) // what should we do here?
      );
    });

    let exportButtons = $("button.export-button[data-project-id]");
    exportButtons.each((_, e) => {
      e = $(e);
      e.click(evt => {
        projectId = parseInt(e.data("project-id"), 10);
        cta.removeClass("hidden");
      });
    });
  }
};
