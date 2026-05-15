(function () {
  'use strict';

  /* ── Selectores ─────────────────────────────────────────── */
  var siteHeader  = document.getElementById('site-header');
  var headerNav   = document.getElementById('header-nav');
  var hamburger   = document.getElementById('header-hamburger');
  var emailGlobalUnsub = document.querySelector('input[name="globalunsub"]');

  /* ── Helpers ─────────────────────────────────────────────── */
  function domReady(cb) {
    if (['interactive', 'complete'].indexOf(document.readyState) >= 0) {
      cb();
    } else {
      document.addEventListener('DOMContentLoaded', cb);
    }
  }

  /* ── Scroll → .is-scrolled ───────────────────────────────── */
  function handleScroll() {
    if (!siteHeader) return;
    if (window.scrollY > 10) {
      siteHeader.classList.add('is-scrolled');
    } else {
      siteHeader.classList.remove('is-scrolled');
    }
  }

  /* ── Menú móvil ──────────────────────────────────────────── */
  function openNav() {
    if (!headerNav || !hamburger) return;
    headerNav.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    if (!headerNav || !hamburger) return;
    headerNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleNav() {
    if (headerNav && headerNav.classList.contains('is-open')) {
      closeNav();
    } else {
      openNav();
    }
  }

  /* ── Cerrar nav al hacer click fuera del header ──────────── */
  function handleOutsideClick(e) {
    if (!siteHeader || !headerNav) return;
    if (headerNav.classList.contains('is-open') && !siteHeader.contains(e.target)) {
      closeNav();
    }
  }

  /* ── Cerrar nav al pasar a viewport desktop ──────────────── */
  function handleResize() {
    if (window.innerWidth >= 768 && headerNav && headerNav.classList.contains('is-open')) {
      closeNav();
    }
  }

  /* ── Deshabilitar checkboxes en página de email unsub ────── */
  function toggleDisabled() {
    var items = document.querySelectorAll('#email-prefs-form .item');
    items.forEach(function (item) {
      var input = item.querySelector('input');
      if (emailGlobalUnsub.checked) {
        item.classList.add('disabled');
        input.setAttribute('disabled', 'disabled');
        input.checked = false;
      } else {
        item.classList.remove('disabled');
        input.removeAttribute('disabled');
      }
    });
  }

  /* ── Zoom lupa genérico (.protoplano-img-zoom) ──────────── */
  /*
    Reutiliza el mismo patrón que ubicacion.module:
    - IntersectionObserver para fade-up al entrar en viewport
    - mousemove → transform-origin dinámico (zoom sigue al cursor)
    - mouseleave → reset al centro
    Las propiedades CSS translate y scale son independientes
    para que el fade-up y el zoom no se pisen.
  */
  function initZoomImg(wrapper) {
    var img = wrapper.querySelector('img');
    if (!img) return;

    /* Fade-up inicial */
    img.style.opacity    = '0';
    img.style.translate  = '0 30px';
    img.style.transition =
      'opacity 0.85s ease, translate 0.85s cubic-bezier(0.25,0.46,0.45,0.94), scale 0.45s ease';
    img.style.willChange = 'opacity, translate, scale';
    img.style.scale      = '1';

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.translate = '0 0';
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(img);

    wrapper.addEventListener('mousemove', function (e) {
      if (!img.classList.contains('is-visible')) return;
      var rect = wrapper.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width)  * 100;
      var y = ((e.clientY - rect.top)  / rect.height) * 100;
      img.style.transformOrigin = x + '% ' + y + '%';
      img.style.scale           = '2.5';
    });

    wrapper.addEventListener('mouseleave', function () {
      img.style.transformOrigin = 'center center';
      img.style.scale           = '1';
    });
  }

  /* ── Init ────────────────────────────────────────────────── */
  domReady(function () {
    if (!document.body) return;

    /* Scroll sticky */
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    /* Hamburger: click + teclado */
    if (hamburger) {
      hamburger.addEventListener('click', toggleNav);
      hamburger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleNav();
        }
      });
    }

    /* Cerrar al hacer click en un link del nav (móvil) */
    if (headerNav) {
      var navLinks = headerNav.querySelectorAll('.menu__link');
      navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          if (headerNav.classList.contains('is-open')) closeNav();
        });
      });
    }

    /* Cerrar con Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && headerNav && headerNav.classList.contains('is-open')) {
        closeNav();
        if (hamburger) hamburger.focus();
      }
    });

    /* Cerrar al click fuera del header */
    document.addEventListener('click', handleOutsideClick);

    /* Cerrar al redimensionar a desktop */
    window.addEventListener('resize', handleResize);

    /* Email unsubscribe */
    if (emailGlobalUnsub) {
      emailGlobalUnsub.addEventListener('change', toggleDisabled);
    }

    /* Zoom lupa: inicializar en todos los wrappers de la página */
    document.querySelectorAll('.protoplano-img-zoom').forEach(initZoomImg);
  });

})();
