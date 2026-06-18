(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     LIGHTBOX 1 — Grid de prototipos (div-based)
  ═══════════════════════════════════════════════════════════ */

  function openLightbox(lb, trigger) {
    lb.setAttribute('aria-hidden', 'false');
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    if (!trigger.id) trigger.id = 'hero-lb-trigger-' + Date.now();
    lb.dataset.triggerId = trigger.id;

    var closeBtn = lb.querySelector('.hero-lightbox__close');
    if (closeBtn) closeBtn.focus();

    lb.addEventListener('keydown', trapFocus);
  }

  function closeLightbox(lb) {
    lb.setAttribute('aria-hidden', 'true');
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    lb.removeEventListener('keydown', trapFocus);

    var triggerId = lb.dataset.triggerId;
    if (triggerId) {
      var trigger = document.getElementById(triggerId);
      if (trigger) trigger.focus();
    }
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    var focusable = Array.from(
      this.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });

    if (!focusable.length) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  /* ═══════════════════════════════════════════════════════════
     LIGHTBOX 2 — Formulario de captación (native <dialog>)
  ═══════════════════════════════════════════════════════════ */

  /* Devuelve la config del módulo hero que contiene este dialog.
     dialogId = "hero-rv-dialog-{uid}"  →  script id = "hero-rv-cfg-{uid}" */
  function getCfgForDialog(dialogId) {
    var uid = dialogId.replace('hero-rv-dialog-', '');
    var cfgScript = document.getElementById('hero-rv-cfg-' + uid);
    if (!cfgScript) return null;
    try { return JSON.parse(cfgScript.textContent); } catch (e) { return null; }
  }

  function validate(form) {
    var valid = true;
    ['firstname', 'lastname', 'email', 'phone'].forEach(function (name) {
      var input = form.querySelector('[name="' + name + '"]');
      var errEl = form.querySelector('[data-error="' + name + '"]');
      if (!input) return;

      var ok = input.value.trim().length > 0;
      if (name === 'email') ok = ok && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());

      input.classList.toggle('is-error', !ok);
      if (errEl) errEl.hidden = ok;
      if (!ok) valid = false;
    });
    return valid;
  }

  function submitToHubSpot(cfg, fields, onSuccess, onError) {
    if (!cfg.portalId || !cfg.formGuid) {
      console.warn('[hero-rv] Portal ID o Form GUID no configurados');
      onSuccess(); /* Abre el tour igualmente */
      return;
    }

    var url = 'https://api.hsforms.com/submissions/v3/integration/submit/'
              + cfg.portalId + '/' + cfg.formGuid;

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: [
          { name: 'firstname',                          value: fields.firstname },
          { name: 'lastname',                           value: fields.lastname  },
          { name: 'email',                              value: fields.email     },
          { name: 'phone',                              value: fields.phone     },
          { name: 'que_prototipo_te_interesa_madeira',  value: fields.nombre    }
        ],
        context: { pageUri: window.location.href, pageName: document.title }
      })
    })
    .then(function (res) {
      if (res.ok || res.status === 200) { onSuccess(); }
      else { onError('HTTP ' + res.status); }
    })
    .catch(onError);
  }

  function initRVDialog(dialog, cfg) {
    if (dialog.dataset.rvInit) return;
    dialog.dataset.rvInit = '1';

    var form       = dialog.querySelector('.rv-form');
    var successEl  = dialog.querySelector('.rv-success');
    var submitBtn  = dialog.querySelector('[data-submit-btn]');
    var tituloEl   = dialog.querySelector('[data-rv-titulo]');

    /* Cerrar el dialog (botón X y botón en success) */
    dialog.addEventListener('click', function (e) {
      if (e.target.closest('[data-rv-close]')) {
        dialog.close();
        /* Resetear al estado inicial */
        if (form)      { form.hidden = false; form.reset(); }
        if (successEl) successEl.hidden = true;
        form && form.querySelectorAll('.is-error').forEach(function (el) {
          el.classList.remove('is-error');
        });
        form && form.querySelectorAll('[data-error]').forEach(function (el) {
          el.hidden = true;
        });
      }
    });

    /* Escape nativo del <dialog> — limpiar estado también */
    dialog.addEventListener('cancel', function () {
      if (form)      { form.hidden = false; form.reset(); }
      if (successEl) successEl.hidden = true;
    });

    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';

      var fields = {
        firstname: form.querySelector('[name="firstname"]').value.trim(),
        lastname:  form.querySelector('[name="lastname"]').value.trim(),
        email:     form.querySelector('[name="email"]').value.trim(),
        phone:     form.querySelector('[name="phone"]').value.trim(),
        nombre:    dialog.dataset.rvNombre || ''
      };

      submitToHubSpot(cfg, fields, function () {
        /* Abrir el tour en nueva pestaña */
        var url = dialog.dataset.rvUrl;
        if (url) window.open(url, '_blank', 'noopener,noreferrer');

        /* Mostrar estado de éxito */
        form.hidden = true;
        if (successEl) successEl.hidden = false;

        submitBtn.disabled = false;
        submitBtn.textContent = dialog.dataset.rvBtnTexto || 'Iniciar recorrido 360';
      }, function (err) {
        console.error('[hero-rv] Error al enviar formulario:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = dialog.dataset.rvBtnTexto || 'Iniciar recorrido 360';
        alert('Hubo un problema al enviar tus datos. Por favor intenta de nuevo.');
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     INIT GLOBAL
  ═══════════════════════════════════════════════════════════ */

  function init() {
    /* Inicializar todos los rv-dialogs del hero-home en página */
    document.querySelectorAll('.hero-home .rv-dialog').forEach(function (dialog) {
      var cfg = getCfgForDialog(dialog.id);
      if (cfg) initRVDialog(dialog, cfg);
    });

    /* Click delegado global */
    document.addEventListener('click', function (e) {

      /* Abrir lightbox 1 */
      var lbOpen = e.target.closest('[data-hero-lb-open]');
      if (lbOpen) {
        var lb = document.getElementById(lbOpen.getAttribute('data-hero-lb-open'));
        if (lb) openLightbox(lb, lbOpen);
        return;
      }

      /* Cerrar lightbox 1 */
      var lbClose = e.target.closest('[data-hero-lb-close]');
      if (lbClose) {
        var lb2 = document.getElementById(lbClose.getAttribute('data-hero-lb-close'));
        if (lb2) closeLightbox(lb2);
        return;
      }

      /* Abrir dialog de captación desde botón de prototipo */
      var rvBtn = e.target.closest('[data-rv-dialog]');
      if (rvBtn) {
        var dialogId    = rvBtn.getAttribute('data-rv-dialog');
        var lbId        = rvBtn.getAttribute('data-rv-lb');
        var nombre      = rvBtn.getAttribute('data-rv-nombre')      || '';
        var url         = rvBtn.getAttribute('data-rv-url')         || '';
        var rvTitulo    = rvBtn.getAttribute('data-rv-titulo')      || '';
        var rvDesc      = rvBtn.getAttribute('data-rv-descripcion') || '';
        var rvBtnTexto  = rvBtn.getAttribute('data-rv-btn-texto')   || 'Iniciar recorrido 360';

        /* 1. Cerrar lightbox 1 */
        if (lbId) {
          var lb3 = document.getElementById(lbId);
          if (lb3) closeLightbox(lb3);
        }

        /* 2. Preparar y abrir dialog */
        var rvDialog = document.getElementById(dialogId);
        if (!rvDialog) return;

        /* Guardar contexto del prototipo (submit handler los lee aquí) */
        rvDialog.dataset.rvNombre   = nombre;
        rvDialog.dataset.rvUrl      = url;
        rvDialog.dataset.rvBtnTexto = rvBtnTexto;

        /* Poblar título, descripción y botón con los valores de esta tarjeta */
        var tituloEl = rvDialog.querySelector('[data-rv-titulo]');
        if (tituloEl) {
          tituloEl.textContent = rvTitulo
            || (nombre ? 'Conoce ' + nombre + ' desde adentro' : 'Conoce nuestros modelos desde adentro');
        }

        var descEl = rvDialog.querySelector('[data-rv-desc]');
        if (descEl) descEl.textContent = rvDesc;

        var submitBtn = rvDialog.querySelector('[data-submit-btn]');
        if (submitBtn) submitBtn.textContent = rvBtnTexto;

        rvDialog.showModal();
        document.body.style.overflow = 'hidden';

        /* Restaurar overflow cuando el dialog se cierre */
        rvDialog.addEventListener('close', function onClose() {
          document.body.style.overflow = '';
          rvDialog.removeEventListener('close', onClose);
        }, { once: true });

        return;
      }
    });

    /* Escape — cerrar lightbox 1 si está abierto (el <dialog> maneja el suyo propio) */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var openLb = document.querySelector('.hero-lightbox.is-open');
      if (openLb) closeLightbox(openLb);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
