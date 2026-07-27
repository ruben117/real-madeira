(function () {
  var section = document.getElementById('aviso-privacidad-{{ module.unique_id }}');
  if (!section) return;

  var nav      = section.querySelector('.aviso-privacidad__tabs');
  var tabs     = section.querySelectorAll('[data-aviso-tab]');
  var secciones = section.querySelectorAll('[data-aviso-seccion]');

  function setActive(idx) {
    tabs.forEach(function (t) {
      t.classList.toggle('is-active', t.getAttribute('data-aviso-tab') === idx);
    });
  }

  function scrollToSeccion(idx) {
    var el = section.querySelector('[data-aviso-seccion="' + idx + '"]');
    if (!el) return;
    var navH    = nav ? nav.getBoundingClientRect().height : 0;
    var headerH = 70;
    var offset  = headerH + navH + 16;
    var top     = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var idx = tab.getAttribute('data-aviso-tab');
      setActive(idx);
      scrollToSeccion(idx);
    });
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.getAttribute('data-aviso-seccion'));
        }
      });
    }, { rootMargin: '-30% 0px -65% 0px' });

    secciones.forEach(function (s) { io.observe(s); });
  }
}());
