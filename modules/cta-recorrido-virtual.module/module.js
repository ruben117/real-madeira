/* ============================================================
   CTA — RECORRIDO VIRTUAL
   Abre dialog con formulario → envío opcional a HubSpot Forms
   → abre URL del recorrido seleccionado en nueva pestaña
   ============================================================ */

(function () {
  'use strict';

  function init() {
    document.querySelectorAll('[id^="cta-rv-"]').forEach(function (root) {
      if (root.dataset.rvInit) return;

      var uid   = root.id.replace('cta-rv-', '');
      var cfgEl = document.getElementById('rv-cfg-' + uid);
      if (!cfgEl) return;

      var cfg;
      try { cfg = JSON.parse(cfgEl.textContent); }
      catch (e) { console.error('[RV] Config error:', e); return; }

      root.dataset.rvInit = '1';
      initRV(root, cfg, uid);
    });
  }

  function initRV(root, cfg, uid) {
    var dialog    = document.getElementById('rv-dialog-' + uid);
    var form      = document.getElementById('rv-form-' + uid);
    var successEl = document.getElementById('rv-success-' + uid);
    if (!dialog || !form || !successEl) return;

    var submitBtn = form.querySelector('[data-submit-btn]');

    /* ── Abrir ────────────────────────────────────────────── */
    root.querySelectorAll('[data-rv-open]').forEach(function (btn) {
      btn.addEventListener('click', function () { dialog.showModal(); });
    });

    /* ── Cerrar y resetear ────────────────────────────────── */
    function resetDialog() {
      form.reset();
      form.hidden      = false;
      successEl.hidden = true;
      clearErrors();
      if (submitBtn) {
        submitBtn.disabled    = false;
        submitBtn.textContent = cfg.btnEnviarTexto || 'Ver mi recorrido';
      }
    }

    function closeDialog() { dialog.close(); resetDialog(); }

    dialog.querySelectorAll('[data-rv-close]').forEach(function (btn) {
      btn.addEventListener('click', closeDialog);
    });

    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) closeDialog();
    });

    dialog.addEventListener('cancel', resetDialog);

    /* ── Validación ───────────────────────────────────────── */
    function clearErrors() {
      form.querySelectorAll('.rv-form__error').forEach(function (el) { el.hidden = true; });
      form.querySelectorAll('.rv-form__input, .rv-form__select').forEach(function (el) {
        el.classList.remove('is-error');
      });
    }

    function showError(name, msg) {
      var errEl   = form.querySelector('[data-error="' + name + '"]');
      var inputEl = form.querySelector('[name="' + name + '"]');
      if (errEl)   { errEl.textContent = msg; errEl.hidden = false; }
      if (inputEl) inputEl.classList.add('is-error');
    }

    function validEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    /* ── Submit ───────────────────────────────────────────── */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      var nombre   = form.querySelector('[name="nombre"]').value.trim();
      var email    = form.querySelector('[name="email"]').value.trim();
      var tel      = form.querySelector('[name="telefono"]').value.trim();
      var selectEl = form.querySelector('[name="recorrido"]');
      var recIdx   = selectEl ? selectEl.value : '0';

      var valid = true;
      if (!nombre)             { showError('nombre',    'Ingresa tu nombre completo');           valid = false; }
      if (!validEmail(email))  { showError('email',     'Ingresa un correo electrónico válido'); valid = false; }
      if (!tel)                { showError('telefono',  'Ingresa tu número de teléfono');        valid = false; }
      if (recIdx === '')       { showError('recorrido', 'Selecciona un prototipo');              valid = false; }

      if (!valid) return;

      var recorrido = cfg.recorridos[parseInt(recIdx, 10)];
      if (!recorrido || !recorrido.url) {
        showError('recorrido', 'URL del recorrido no configurada');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled    = true;
        submitBtn.textContent = 'Abriendo…';
      }

      /* ── Envío opcional a HubSpot Forms API ─────────────── */
      if (cfg.portalId && cfg.formGuid) {
        fetch(
          'https://api.hsforms.com/submissions/v3/integration/submit/'
          + cfg.portalId + '/' + cfg.formGuid,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: [
                { name: 'firstname', value: nombre },
                { name: 'email',     value: email },
                { name: 'phone',     value: tel },
                { name: 'message',   value: 'Recorrido: ' + recorrido.nombre }
              ],
              context: {
                pageUri:  window.location.href,
                pageName: document.title
              }
            })
          }
        ).catch(function () { /* falla silenciosa */ });
      }

      /* ── Abrir recorrido ────────────────────────────────── */
      window.open(recorrido.url, '_blank', 'noopener');

      /* ── Mostrar éxito ──────────────────────────────────── */
      form.hidden      = true;
      successEl.hidden = false;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
