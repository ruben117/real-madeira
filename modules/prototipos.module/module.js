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

    /* ── Config desde data-attributes ── */
    var autoplay  = slider.getAttribute('data-autoplay') === 'true';
    var interval  = parseInt(slider.getAttribute('data-interval'), 10) || 6000;
    var autoTimer = null;

    /* Precarga todas las imágenes de fondo para evitar destello */
    panels.forEach(function (panel) {
      var url = panel.getAttribute('data-bg');
      if (url) { (new Image()).src = url; }
    });

    function goTo(index) {
      current = (index + total) % total;

      panels.forEach(function (el, i) { el.classList.toggle('is-active', i === current); });
      cards.forEach(function (el, i)  { el.classList.toggle('is-active', i === current); });

      /* Actualiza el fondo del dnd-section padre */
      var bgUrl = panels[current] && panels[current].getAttribute('data-bg');
      if (section && bgUrl) {
        section.style.backgroundImage    = "url('" + bgUrl + "')";
        section.style.backgroundSize     = 'cover';
        section.style.backgroundPosition = 'center';
        section.style.backgroundColor    = '#1F140F';
      }
    }

    /* ── Autoplay ── */
    function startAuto() {
      if (!autoplay) return;
      stopAuto();
      autoTimer = setInterval(function () { goTo(current + 1); }, interval);
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    function resetAuto() { stopAuto(); startAuto(); }

    if (btnPrev) btnPrev.addEventListener('click', function () { goTo(current - 1); resetAuto(); });
    if (btnNext) btnNext.addEventListener('click', function () { goTo(current + 1); resetAuto(); });

    goTo(0);
    startAuto();
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
