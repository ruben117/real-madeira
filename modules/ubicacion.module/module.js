(function () {
  'use strict';

  function initUbicacion(container) {
    var mapImg  = container.querySelector('.ubicacion-mapa__img');
    var zoomEl  = container.querySelector('.ubicacion-mapa__zoom');

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

    /* ── Efecto lupa: zoom hacia la posición del cursor ── */
    if (zoomEl && mapImg) {

      zoomEl.addEventListener('mousemove', function (e) {
        /* Solo activo una vez que la imagen ya es visible (fade-in completado) */
        if (!mapImg.classList.contains('is-visible')) return;

        var rect = zoomEl.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;

        /* transform-origin solo afecta a `scale`, no a `translate` (CSS individual transforms) */
        mapImg.style.transformOrigin = x + '% ' + y + '%';
      });

      zoomEl.addEventListener('mouseleave', function () {
        /* Restaurar origen al salir para que el zoom-out sea al centro */
        mapImg.style.transformOrigin = 'center center';
      });
    }
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
