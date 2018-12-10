/* globals $: true */

var $ = require("jquery");

module.exports = {
  init: function() {
    let banner = $(".glitch-banner");
    let cta = $(".glitch-cta.underlay");

    if (banner.length && cta.length) {
      let btn = $(".export-button", banner);
      btn.click(() => cta.removeClass("hidden"));
      banner.removeClass("hidden");
    }

    let content = $(".content", cta),
      close = $(".cta-close", content),
      start = $("button.export-button.start", content),
      exportPublished = $("button.export-button.published", content),
      exportUnpublished = $("button.export-button.unpublished", content),
      restoreButtonText = () => {};

    close.click(() => {
      cta.addClass("hidden");
      restoreButtonText();
      [exportPublished, exportUnpublished, start].forEach(e => {
        e.removeClass("busy");
      });
      $(".normal", cta).removeClass("hidden");
      $(".error", cta).addClass("hidden");
    });

    let csrfToken = $("meta[name='csrf-token']").attr("content"),
      importURL = $("meta[name='glitch-url']").attr("content"),
      exportLabel = $("meta[name='export-label']").attr("content"),
      projectId = $("meta[name='project-id']").attr("content"),
      publishId = $("meta[name='publish-id']").attr("content");

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
    }

    // We track the projectId "globally" for a dialog, because there
    // can only ever be one dialog open at a time, triggered for
    // one specific project to be exported.

    let runOperation = (evt, button, published) => {
      let root = published ? `publishedprojects` : `projects`;
      let id = published ? publishId : projectId;
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

          window.location = `${importURL}?${args}`;
        },
        notifyError
      );
    };

    start.click(evt => runOperation(evt, start));
    exportUnpublished.click(evt => runOperation(evt, exportUnpublished));
    exportPublished.click(evt => runOperation(evt, exportPublished, true));
  }
};
