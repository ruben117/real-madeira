(function () {
  // Variables
  var header = document.getElementById('site-header');
  var nav = document.querySelector('.header__navigation');
  var allToggles = document.querySelectorAll('.header--toggle');
  var navToggle = document.querySelector('.header__navigation--toggle');
  var closeToggle = document.querySelector('.header__close--toggle');
  var allElements = document.querySelectorAll('.header--element, .header--toggle');
  var emailGlobalUnsub = document.querySelector('input[name="globalunsub"]');

  // Functions

  function domReady(callback) {
    if (['interactive', 'complete'].indexOf(document.readyState) >= 0) {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  // Sticky header: añade clase cuando el usuario hace scroll
  function handleScroll() {
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  // Abrir/cerrar menú de navegación móvil
  function toggleNav() {
    allToggles.forEach(function (toggle) {
      toggle.classList.toggle('hide');
    });

    nav.classList.toggle('open');
    navToggle.classList.toggle('open');
    closeToggle.classList.toggle('show');

    var isOpen = nav.classList.contains('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  // Cerrar todo en móvil
  function closeAll() {
    allElements.forEach(function (element) {
      element.classList.remove('hide', 'open');
    });

    closeToggle.classList.remove('show');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Cerrar nav al hacer click en un enlace del menú (móvil)
  function bindNavLinks() {
    if (!nav) return;
    var links = nav.querySelectorAll('.menu__link');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        if (nav.classList.contains('open')) {
          closeAll();
        }
      });
    });
  }

  // Disable email subscription checkboxes when "unsubscribe all" is checked
  function toggleDisabled() {
    var emailSubItem = document.querySelectorAll('#email-prefs-form .item');

    emailSubItem.forEach(function (item) {
      var emailSubItemInput = item.querySelector('input');

      if (emailGlobalUnsub.checked) {
        item.classList.add('disabled');
        emailSubItemInput.setAttribute('disabled', 'disabled');
        emailSubItemInput.checked = false;
      } else {
        item.classList.remove('disabled');
        emailSubItemInput.removeAttribute('disabled');
      }
    });
  }

  // Execute on document ready
  domReady(function () {
    if (!document.body) return;

    // Scroll listener para el header sticky
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // evaluar estado inicial

    // Toggle de navegación móvil
    if (navToggle) {
      navToggle.addEventListener('click', toggleNav);
      navToggle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleNav();
        }
      });
    }

    // Botón cerrar
    if (closeToggle) {
      closeToggle.addEventListener('click', closeAll);
      closeToggle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          closeAll();
        }
      });
    }

    // Cerrar nav al presionar Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav && nav.classList.contains('open')) {
        closeAll();
      }
    });

    bindNavLinks();

    // Email unsubscribe
    if (emailGlobalUnsub) {
      emailGlobalUnsub.addEventListener('change', toggleDisabled);
    }
  });
})();
