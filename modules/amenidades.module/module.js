(function () {
  'use strict';

  function initAmenidades(content) {
    var items   = content.querySelectorAll('.amenidades-grid__item');
    var slides  = content.querySelectorAll('.amenidades-slider__slide');
    var btnPrev = content.querySelector('[data-slider-prev]');
    var btnNext = content.querySelector('[data-slider-next]');
    var current = 0;

    /* ── Config desde data-attributes ── */
    var autoplay  = content.getAttribute('data-autoplay') === 'true';
    var interval  = parseInt(content.getAttribute('data-interval'), 10) || 5000;
    var autoTimer = null;

    /* ── Lightbox ── */
    var lbEl  = document.querySelector('[data-amenidades-lb]');
    var lbImg = lbEl ? lbEl.querySelector('[data-lb-img]') : null;
    var lbIndex = 0;

    /* Recopila src + alt de cada slide */
    var lbImages = [].slice.call(slides).map(function (slide) {
      return {
        src: slide.getAttribute('data-lb-src') || '',
        alt: slide.getAttribute('data-lb-alt') || ''
      };
    });

    function openLb(index) {
      if (!lbEl || !lbImg) return;
      lbIndex = (index + lbImages.length) % lbImages.length;
      lbImg.src = lbImages[lbIndex].src;
      lbImg.alt = lbImages[lbIndex].alt;
      lbEl.hidden = false;
      document.body.style.overflow = 'hidden';
      stopAuto();
    }

    function closeLb() {
      if (!lbEl) return;
      lbEl.hidden = true;
      document.body.style.overflow = '';
      startAuto();
    }

    function prevLb(e) { if (e) e.stopPropagation(); openLb(lbIndex - 1); }
    function nextLb(e) { if (e) e.stopPropagation(); openLb(lbIndex + 1); }

    if (lbEl) {
      /* Cerrar con overlay y botón × */
      lbEl.querySelectorAll('[data-lb-close]').forEach(function (el) {
        el.addEventListener('click', closeLb);
      });
      var lbPrev = lbEl.querySelector('[data-lb-prev]');
      var lbNext = lbEl.querySelector('[data-lb-next]');
      if (lbPrev) lbPrev.addEventListener('click', prevLb);
      if (lbNext) lbNext.addEventListener('click', nextLb);
    }

    /* ESC y flechas de teclado globales */
    document.addEventListener('keydown', function (e) {
      if (!lbEl || lbEl.hidden) return;
      if (e.key === 'Escape')      { closeLb(); }
      if (e.key === 'ArrowLeft')   { prevLb(); }
      if (e.key === 'ArrowRight')  { nextLb(); }
    });

    /* ── Slide activo: clic → abre lightbox ── */
    slides.forEach(function (slide, i) {
      slide.addEventListener('click', function () {
        if (slide.classList.contains('is-active')) {
          openLb(i);
        }
      });
    });

    /* ── Navegación del slider ── */
    function goTo(index) {
      var total = items.length;
      current = (index + total) % total;

      items.forEach(function (item, i) {
        var active = i === current;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      slides.forEach(function (slide, i) {
        var active = i === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
    }

    items.forEach(function (item, i) {
      item.addEventListener('click', function () {
        goTo(i);
        resetAuto();
      });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goTo(i);
          resetAuto();
        }
      });
    });

    if (btnPrev) btnPrev.addEventListener('click', function () { goTo(current - 1); resetAuto(); });
    if (btnNext) btnNext.addEventListener('click', function () { goTo(current + 1); resetAuto(); });

    /* ── Autoplay ── */
    function startAuto() {
      if (!autoplay) return;
      stopAuto();
      autoTimer = setInterval(function () {
        if (lbEl && !lbEl.hidden) return; /* pausa si el lightbox está abierto */
        goTo(current + 1);
      }, interval);
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    function resetAuto() { stopAuto(); startAuto(); }

    goTo(0);
    startAuto();
  }

  function init() {
    document.querySelectorAll('[data-amenidades]').forEach(function (el) {
      initAmenidades(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
