(function () {
  'use strict';

  function initUbicacion(container) {
    var mapImg  = container.querySelector('.ubicacion-mapa__img');
    var trigger = container.querySelector('[data-ub-map-open]');
    var lbId    = trigger ? trigger.getAttribute('data-ub-map-open') : null;
    var lb      = lbId ? document.getElementById(lbId) : null;

    /* ── Animación fade-up al entrar al viewport ── */
    if (mapImg) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      observer.observe(mapImg);
    }

    if (!trigger || !lb) return;

    /* ── Lightbox ── */
    function openLb() {
      lb.removeAttribute('hidden');
      lb.focus();
      document.body.style.overflow = 'hidden';
    }

    function closeLb() {
      lb.setAttribute('hidden', '');
      document.body.style.overflow = '';
      trigger.focus();
    }

    trigger.addEventListener('click', openLb);

    lb.querySelectorAll('[data-ub-map-close]').forEach(function (el) {
      el.addEventListener('click', closeLb);
    });

    lb.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeLb(); }
    });
  }

  function init() {
    document.querySelectorAll('[data-ubicacion]').forEach(function (el) {
      initUbicacion(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
