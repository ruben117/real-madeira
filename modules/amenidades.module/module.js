(function () {
  'use strict';

  function initAmenidades(content) {
    var items  = content.querySelectorAll('.amenidades-grid__item');
    var slides = content.querySelectorAll('.amenidades-slider__slide');
    var btnPrev = content.querySelector('[data-slider-prev]');
    var btnNext = content.querySelector('[data-slider-next]');
    var current = 0;

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
      item.addEventListener('click', function () { goTo(i); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goTo(i);
        }
      });
    });

    if (btnPrev) btnPrev.addEventListener('click', function () { goTo(current - 1); });
    if (btnNext) btnNext.addEventListener('click', function () { goTo(current + 1); });

    goTo(0);
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
