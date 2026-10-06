(function () {
  'use strict';

  function initFaq(faq) {
    var triggers = faq.querySelectorAll('[data-faq-trigger]');

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var item = trigger.closest('[data-faq-item]');
        var isOpen = item.classList.contains('is-open');

        // Cierra todos los items abiertos
        faq.querySelectorAll('[data-faq-item].is-open').forEach(function (openItem) {
          openItem.classList.remove('is-open');
          openItem.querySelector('[data-faq-trigger]').setAttribute('aria-expanded', 'false');
        });

        // Abre el item clickeado (si estaba cerrado)
        if (!isOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function init() {
    document.querySelectorAll('[data-faq]').forEach(initFaq);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
