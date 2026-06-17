/* ============================================================
   CTA — RECORRIDO VIRTUAL
   Campos HubSpot: firstname, lastname, email, phone,
   que_prototipo_te_interesa_madeira (oculto = rec_nombre)
   Al enviar: registra lead en HubSpot y abre recorrido URL
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

      if (!cfg.portalId || !cfg.formGuid) {
        console.warn('[RV] Portal ID o Form GUID no configurados — el lead no se registrará en HubSpot.');
      }

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
        submitBtn.textContent = cfg.btnEnviarTexto || 'Iniciar recorrido 360';
      }
    }

    function closeDialog() { dialog.close(); resetDialog(); }

    dialog.querySelectorAll('[data-rv-close]').forEach(function (btn) {
      btn.addEventListener('click', closeDialog);
    });

    /* Clic en el backdrop */
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) closeDialog();
    });

    /* ESC nativo */
    dialog.addEventListener('cancel', resetDialog);

    /* ── Validación ───────────────────────────────────────── */
    function clearErrors() {
      form.querySelectorAll('.rv-form__error').forEach(function (el) { el.hidden = true; });
      form.querySelectorAll('.rv-form__input').forEach(function (el) {
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

      var firstname = form.querySelector('[name="firstname"]').value.trim();
      var lastname  = form.querySelector('[name="lastname"]').value.trim();
      var email     = form.querySelector('[name="email"]').value.trim();
      var phone     = form.querySelector('[name="phone"]').value.trim();

      var valid = true;
      if (!firstname)           { showError('firstname', 'Ingresa tu nombre');              valid = false; }
      if (!lastname)            { showError('lastname',  'Ingresa tus apellidos');          valid = false; }
      if (!validEmail(email))   { showError('email',     'Ingresa un correo válido');       valid = false; }
      if (!phone)               { showError('phone',     'Ingresa tu número de teléfono'); valid = false; }

      if (!valid) return;

      if (!cfg.recUrl) {
        console.error('[RV] URL del recorrido no configurada.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled    = true;
        submitBtn.textContent = 'Abriendo…';
      }

      /* ── Envío a HubSpot Forms API ───────────────────────── */
      if (cfg.portalId && cfg.formGuid) {
        fetch(
          'https://api.hsforms.com/submissions/v3/integration/submit/'
          + cfg.portalId + '/' + cfg.formGuid,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: [
                { name: 'firstname',                          value: firstname },
                { name: 'lastname',                           value: lastname  },
                { name: 'email',                              value: email     },
                { name: 'phone',                              value: phone     },
                { name: 'que_prototipo_te_interesa_madeira',  value: cfg.recNombre }
              ],
              context: {
                pageUri:  window.location.href,
                pageName: document.title
              }
            })
          }
        ).catch(function () { /* falla silenciosa — siempre abre el tour */ });
      }

      /* ── Abrir recorrido en nueva pestaña ─────────────────── */
      window.open(cfg.recUrl, '_blank', 'noopener');

      /* ── Mostrar estado de éxito ──────────────────────────── */
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
