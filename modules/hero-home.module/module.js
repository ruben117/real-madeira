(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }

  /* ── Abrir lightbox ──────────────────────────────────── */
  function openLightbox(lb, trigger) {
    lb.setAttribute('aria-hidden', 'false');
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    /* Guardar ref al trigger para restaurar el foco al cerrar */
    lb.dataset.triggerId = trigger.id || '';
    if (!trigger.id) trigger.id = 'hero-lb-trigger-' + Date.now();
    lb.dataset.triggerId = trigger.id;

    /* Foco en el botón cerrar */
    var closeBtn = lb.querySelector('.hero-lightbox__close');
    if (closeBtn) closeBtn.focus();

    /* Focus trap */
    lb.addEventListener('keydown', trapFocus);
  }

  /* ── Cerrar lightbox ─────────────────────────────────── */
  function closeLightbox(lb) {
    lb.setAttribute('aria-hidden', 'true');
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    lb.removeEventListener('keydown', trapFocus);

    /* Devolver foco al trigger */
    var triggerId = lb.dataset.triggerId;
    if (triggerId) {
      var trigger = document.getElementById(triggerId);
      if (trigger) trigger.focus();
    }
  }

  /* ── Focus trap dentro del lightbox ─────────────────── */
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    var focusable = Array.from(
      this.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });

    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ── Init ─────────────────────────────────────────────── */
  function init() {
    /* Click delegado en el documento */
    document.addEventListener('click', function (e) {

      /* Abrir */
      var openTrigger = e.target.closest('[data-hero-lb-open]');
      if (openTrigger) {
        var lbId = openTrigger.getAttribute('data-hero-lb-open');
        var lb = document.getElementById(lbId);
        if (lb) openLightbox(lb, openTrigger);
        return;
      }

      /* Cerrar (backdrop o botón X) */
      var closeTrigger = e.target.closest('[data-hero-lb-close]');
      if (closeTrigger) {
        var lbId2 = closeTrigger.getAttribute('data-hero-lb-close');
        var lb2 = document.getElementById(lbId2);
        if (lb2) closeLightbox(lb2);
        return;
      }
    });

    /* Escape cierra el lightbox abierto */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var openLb = document.querySelector('.hero-lightbox.is-open');
      if (openLb) closeLightbox(openLb);
    });
  }

  /* ── Arranque ─────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
