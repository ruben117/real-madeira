(function () {
  'use strict';

  function init() {
    var imgs = document.querySelectorAll('.inversion-content__infografia');
    if (!imgs.length) return;

    /* Intersection Observer: añade .is-visible cuando entra al viewport */
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); /* dispara solo una vez */
        }
      });
    }, {
      threshold: 0.12  /* empieza cuando el 12% de la imagen es visible */
    });

    imgs.forEach(function (img) {
      observer.observe(img);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
