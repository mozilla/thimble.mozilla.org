/* globals $: true */

var $ = require("jquery");
var strings = require("strings");

module.exports = {
  init: function() {
    let banner = $(".glitch-banner"),
      cta = $(".glitch-cta.underlay"),
      content = $(".content", cta),
      close = $(".cta-close", content),
      start = $("button.export-button.start", content),
      exportPublished = $("button.export-button.published", content),
      exportUnpublished = $("button.export-button.unpublished", content),
      csrfToken = $("meta[name='csrf-token']").attr("content"),
      importURL = $("meta[name='glitch-url']").attr("content"),
      exportLabel = $("meta[name='export-label']").attr("content"),
      exportedLink = $("a.exported-link", content),
      projectId = undefined,
      projectPubId = undefined,
      projectUrl = undefined,
      restoreButtonText = () => {},
      currentExportProjectButton;

    function getToken(url, onSuccess, onError) {
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
        .then(object => onSuccess(object.token))
        .catch(e => onError(e));
    }

    function notifyError(error) {
      $(".normal", cta).addClass("hidden");
      $(".error", cta).removeClass("hidden");
      restoreButtonText();
      currentExportProjectButton = null;
    }

    if (banner.length && cta.length) {
      banner.removeClass("hidden");
    }

    // We track the projectId "globally" for a dialog, because there
    // can only ever be one dialog open at a time, triggered for
    // one specific project to be exported.

    let runOperation = (evt, button, published) => {
      let root = published ? `publishedprojects` : `projects`;
      let id = published ? projectPubId : projectId;
      let url = `/${root}/${id}/export/start`;

      $("button.export-button", cta).each((i, e) => e.classList.add("busy"));

      let label = $("span.label", button);
      let labelText = label.text();
      restoreButtonText = () => label.text(labelText);
      label.text(exportLabel);

      getToken(
        url,
        token => {
          let args = `TOKEN=${token}&ID=${id}`;

          if (published) {
            args = `${args}&PUBLISHED=true`;
          }

          currentExportProjectButton.replaceWith(
            `<div class="hooray">${strings.get("glitchProjectMigrated")}</div>`
          );
          currentExportProjectButton = null;

          exportedLink.attr("href", `${importURL}?${args}`);
          [exportPublished, exportUnpublished, start].forEach(e => {
            e.addClass("hidden");
          });
          exportedLink.one("click", () => {
            close.trigger("click");
            exportedLink.addClass("hidden");
          });
          $(".export-link-button", exportedLink).removeClass("busy");
          exportedLink.removeClass("hidden");
        },
        notifyError
      );
    };

    start.click(evt => runOperation(evt, start));
    exportUnpublished.click(evt => runOperation(evt, exportUnpublished));
    exportPublished.click(evt => runOperation(evt, exportPublished, true));

    close.click(() => {
      cta.addClass("hidden");
      restoreButtonText();
      [exportPublished, exportUnpublished, start].forEach(e => {
        e.removeClass("busy");
        e.addClass("hidden");
      });
      $(".normal", cta).removeClass("hidden");
      $(".error", cta).addClass("hidden");
      currentExportProjectButton = null;
    });

    $("button.export-button[data-project-id]").each((_, e) => {
      const exportButton = $(e);

      exportButton.click(evt => {
        let data = e.dataset;
        projectId = parseInt(data.projectId, 10);
        projectPubId = parseInt(data.publishedId, 10);

        if (data.projectUrl) {
          exportPublished.removeClass("hidden");
          exportUnpublished.removeClass("hidden");
        } else {
          start.removeClass("hidden");
        }

        cta.removeClass("hidden");
        currentExportProjectButton = exportButton;
      });
    });
  }
};
