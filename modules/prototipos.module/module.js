(function () {
  'use strict';

  function initPrototipos(slider) {
    var panels  = slider.querySelectorAll('.prototipos-panel');
    var cards   = slider.querySelectorAll('.prototipos-card');
    var btnPrev = slider.querySelector('[data-proto-prev]');
    var btnNext = slider.querySelector('[data-proto-next]');
    var total   = panels.length;
    var current = 0;

    var section = slider.closest('.dnd-section');

    /* Precarga todas las imágenes de fondo para evitar destello al cambiar slide */
    panels.forEach(function (panel) {
      var url = panel.getAttribute('data-bg');
      if (url) { (new Image()).src = url; }
    });

    function goTo(index) {
      current = (index + total) % total;

      panels.forEach(function (el, i) { el.classList.toggle('is-active', i === current); });
      cards.forEach(function (el, i) { el.classList.toggle('is-active', i === current); });

      /* Actualiza el fondo del dnd-section padre */
      var bgUrl = panels[current] && panels[current].getAttribute('data-bg');
      if (section && bgUrl) {
        section.style.backgroundImage    = "url('" + bgUrl + "')";
        section.style.backgroundSize     = 'cover';
        section.style.backgroundPosition = 'center';
      }
    }

    if (btnPrev) btnPrev.addEventListener('click', function () { goTo(current - 1); });
    if (btnNext) btnNext.addEventListener('click', function () { goTo(current + 1); });

    goTo(0);
  }

  function init() {
    document.querySelectorAll('[data-prototipos]').forEach(function (el) {
      initPrototipos(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
