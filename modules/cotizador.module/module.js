/* ============================================================
   COTIZADOR DE VIVIENDA — Real Madeira
   Fórmula: Mensualidad = (Precio − Enganche) × Tasa%
   ============================================================ */

(function () {
  'use strict';

  /* ── Inicializa todas las instancias en la página ─────────── */
  function init() {
    document.querySelectorAll('[id^="cotizador-"]').forEach(function (root) {
      /* Evitar doble-init y procesar solo el contenedor raíz */
      if (root.dataset.cotizadorInit) return;
      if (!root.id.startsWith('cotizador-')) return;

      var uid   = root.id.replace('cotizador-', '');
      var cfgEl = document.getElementById('cotizador-cfg-' + uid);
      if (!cfgEl) return;

      var cfg;
      try { cfg = JSON.parse(cfgEl.textContent); }
      catch (e) { console.error('[Cotizador] Config parse error:', e); return; }

      root.dataset.cotizadorInit = '1';
      initCotizador(root, cfg);
    });
  }

  /* ── Core del cotizador ───────────────────────────────────── */
  function initCotizador(root, cfg) {

    /* ── Estado ─────────────────────────────────────────────── */
    var state = {
      creditoIdx:  0,
      protoIdx:    0,
      equipSel:    [],
      engancheIdx: 0,
    };

    /* ── Helpers ─────────────────────────────────────────────── */
    function mxn(n) {
      return '$' + Math.round(n).toLocaleString('es-MX');
    }

    function q(sel)  { return root.querySelector(sel); }
    function qa(sel) { return root.querySelectorAll(sel); }

    /* ── Formatear precios estáticos de la lista ─────────────── */
    qa('[data-raw]').forEach(function (el) {
      var v = parseInt(el.getAttribute('data-raw'), 10);
      el.textContent = isNaN(v) || v === 0 ? 'Incluido' : mxn(v);
    });

    /* ── Cálculo principal ───────────────────────────────────── */
    function recalc() {
      var proto     = cfg.prototipos[state.protoIdx] || {};
      var basePrice = proto.precio || 0;

      var equipTotal = 0;
      state.equipSel.forEach(function (i) {
        equipTotal += (cfg.equipamientos[i] || {}).precio || 0;
      });

      var totalInversion = basePrice + equipTotal;
      var enganchePct    = cfg.opcionesEnganche[state.engancheIdx] || 0;
      var engancheMonto  = totalInversion * enganchePct / 100;
      var credito        = totalInversion - engancheMonto;
      var tasa           = (cfg.tiposCredito[state.creditoIdx] || {}).tasa || 1;
      var pagoBase       = credito * (tasa / 100);

      q('[data-pago-base]').textContent       = mxn(pagoBase);
      q('[data-modelo-nombre]').textContent   = proto.nombre || '—';
      q('[data-inversion-total]').textContent = mxn(totalInversion);
      q('[data-enganche-monto]').textContent  = mxn(engancheMonto);
      q('[data-monto-credito]').textContent   = mxn(credito);
    }

    /* ── Tipo de crédito ─────────────────────────────────────── */
    qa('[data-credito-idx]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.creditoIdx = parseInt(btn.getAttribute('data-credito-idx'), 10);
        qa('[data-credito-idx]').forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-checked', String(active));
        });
        recalc();
      });
    });

    /* ── Selección de prototipo ──────────────────────────────── */
    qa('[data-proto]').forEach(function (row) {
      row.addEventListener('click', function () {
        state.protoIdx = parseInt(row.getAttribute('data-proto'), 10);
        qa('[data-proto]').forEach(function (r) {
          var active = r === row;
          r.classList.toggle('is-active', active);
          r.setAttribute('aria-checked', String(active));
          r.setAttribute('tabindex', active ? '0' : '-1');
          var icon = r.querySelector('.item-row__icon');
          if (icon) icon.classList.toggle('is-active', active);
        });
        recalc();
      });

      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.click(); }
      });
    });

    /* ── Equipamiento (multi-select) ─────────────────────────── */
    qa('[data-equip]').forEach(function (row) {
      row.addEventListener('click', function () {
        var idx  = parseInt(row.getAttribute('data-equip'), 10);
        var pos  = state.equipSel.indexOf(idx);
        var active;

        if (pos === -1) { state.equipSel.push(idx); active = true; }
        else            { state.equipSel.splice(pos, 1); active = false; }

        row.classList.toggle('is-active', active);
        row.setAttribute('aria-checked', String(active));
        var icon = row.querySelector('.item-row__icon');
        if (icon) icon.classList.toggle('is-active', active);
        recalc();
      });

      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.click(); }
      });
    });

    /* ── Opciones de enganche ────────────────────────────────── */
    qa('[data-enganche-pct]').forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        state.engancheIdx = i;
        qa('[data-enganche-pct]').forEach(function (b, j) {
          var active = j === i;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-checked', String(active));
        });
        recalc();
      });
    });

    /* ── WhatsApp ────────────────────────────────────────────── */
    var waBtn = q('[data-wa-btn]');
    if (waBtn) {
      waBtn.addEventListener('click', function () {
        var proto      = cfg.prototipos[state.protoIdx] || {};
        var engPct     = cfg.opcionesEnganche[state.engancheIdx] || 0;
        var basePrice  = proto.precio || 0;
        var equipTotal = 0;
        state.equipSel.forEach(function (i) {
          equipTotal += (cfg.equipamientos[i] || {}).precio || 0;
        });
        var total     = basePrice + equipTotal;
        var engMonto  = total * engPct / 100;
        var credito   = total - engMonto;
        var tipoCredito = cfg.tiposCredito[state.creditoIdx] || {};
        var tasa      = tipoCredito.tasa || 1;
        var pagoBase  = credito * (tasa / 100);

        var msg = [
          'Hola! Me interesa el prototipo *' + (proto.nombre || '') + '* de Real Madeira.',
          '',
          'Mi simulación:',
          '• Crédito: ' + (tipoCredito.titulo || '—'),
          '• Inversión Total: ' + mxn(total),
          '• Enganche (' + engPct + '%): ' + mxn(engMonto),
          '• Monto de crédito: ' + mxn(credito),
          '• Pago mensual: ' + mxn(pagoBase),
          '',
          '¿Podrían contactarme para más información?'
        ].join('\n');

        window.open('https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      });
    }

    /* ── Descargar PDF ───────────────────────────────────────── */
    var pdfBtn = q('[data-pdf-btn]');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', function () {
        var proto      = cfg.prototipos[state.protoIdx] || {};
        var engPct     = cfg.opcionesEnganche[state.engancheIdx] || 0;
        var basePrice  = proto.precio || 0;
        var equipTotal = 0;
        var equipNames = [];
        state.equipSel.forEach(function (i) {
          var eq = cfg.equipamientos[i] || {};
          equipTotal += eq.precio || 0;
          if (eq.nombre) equipNames.push(eq.nombre);
        });
        var total    = basePrice + equipTotal;
        var engMonto = total * engPct / 100;
        var credito  = total - engMonto;
        var tipoCreditoObj = cfg.tiposCredito[state.creditoIdx] || {};
        var tasa     = tipoCreditoObj.tasa || 1;
        var pago     = credito * (tasa / 100);
        var fecha    = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
        var tipoCredito = tipoCreditoObj.titulo || '—';

        var equipRow = equipNames.length
          ? '<tr><td>Equipamiento</td><td>' + equipNames.join(', ') + '</td></tr>'
          : '';

        var html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">'
          + '<title>Cotización Real Madeira</title>'
          + '<style>'
          + 'body{font-family:Arial,sans-serif;margin:0;padding:40px;color:#1a2340;}'
          + 'header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #e8900a;padding-bottom:16px;margin-bottom:32px;}'
          + 'h1{font-size:20px;margin:0 0 4px;color:#1a2340;}'
          + '.fecha{font-size:12px;color:#6b7280;}'
          + 'table{width:100%;border-collapse:collapse;margin-bottom:32px;}'
          + 'th,td{padding:12px 16px;text-align:left;border-bottom:1px solid #ede9e3;font-size:14px;}'
          + 'th{background:#f5f3ef;font-weight:700;color:#1a2340;width:50%;}'
          + 'td{color:#374151;font-weight:600;text-align:right;}'
          + '.highlight td{color:#e8900a;font-size:16px;}'
          + 'footer{font-size:10px;color:#9ca3af;border-top:1px solid #ede9e3;padding-top:12px;line-height:1.6;}'
          + '@media print{body{padding:20px;}}'
          + '</style></head><body>'
          + '<header>'
          + '<div><h1>Cotización de Vivienda</h1><p class="fecha">' + fecha + '</p></div>'
          + '<div style="text-align:right;font-size:12px;color:#6b7280;">Real Madeira</div>'
          + '</header>'
          + '<table>'
          + '<tr><th>Prototipo</th><td>' + (proto.nombre || '—') + '</td></tr>'
          + '<tr><th>Tipo de crédito</th><td>' + tipoCredito + '</td></tr>'
          + equipRow
          + '<tr><th>Inversión total</th><td>' + mxn(total) + '</td></tr>'
          + '<tr><th>Enganche (' + engPct + '%)</th><td>' + mxn(engMonto) + '</td></tr>'
          + '<tr><th>Monto de crédito</th><td>' + mxn(credito) + '</td></tr>'
          + '<tr class="highlight"><th>Pago mensual fijo*</th><td>' + mxn(pago) + ' /mes</td></tr>'
          + '</table>'
          + '<footer>*Mensualidad estimada. No incluye gastos notariales ni avalúo. Sujeto a cambios sin previo aviso.</footer>'
          + '</body></html>';

        var win = window.open('', '_blank', 'width=700,height=600');
        if (!win) {
          alert('Tu navegador bloqueó la ventana de la cotización. Permite las ventanas emergentes para este sitio e intenta de nuevo.');
          return;
        }
        win.document.write(html);
        win.document.close();
        win.focus();
        win.print();
      });
    }

    /* ── CTA principal: abre el formulario de captación ──────── */
    var ctaBtn  = q('[data-cta-btn]');
    var rvDialog = root.querySelector('.rv-dialog');

    if (ctaBtn && rvDialog) {
      var rvForm      = rvDialog.querySelector('.rv-form');
      var rvSuccess   = rvDialog.querySelector('.rv-success');
      var rvSubmitBtn = rvDialog.querySelector('[data-submit-btn]');
      var rvTituloEl  = rvDialog.querySelector('[data-rv-titulo]');

      function rvValidate(form) {
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

      function rvResetDialog() {
        if (rvForm)    { rvForm.hidden = false; rvForm.reset(); }
        if (rvSuccess) rvSuccess.hidden = true;
        if (rvForm) {
          rvForm.querySelectorAll('.is-error').forEach(function (el) { el.classList.remove('is-error'); });
          rvForm.querySelectorAll('[data-error]').forEach(function (el) { el.hidden = true; });
        }
      }

      ctaBtn.addEventListener('click', function () {
        var proto = cfg.prototipos[state.protoIdx] || {};

        if (rvTituloEl) {
          rvTituloEl.textContent = cfg.formTitulo
            || (proto.nombre ? 'Continúa tu trámite para ' + proto.nombre : 'Continúa tu trámite');
        }

        rvDialog.showModal();
        document.body.style.overflow = 'hidden';
        rvDialog.addEventListener('close', function onClose() {
          document.body.style.overflow = '';
          rvDialog.removeEventListener('close', onClose);
        }, { once: true });
      });

      rvDialog.addEventListener('click', function (e) {
        if (e.target.closest('[data-rv-close]')) {
          rvDialog.close();
          rvResetDialog();
        }
      });

      rvDialog.addEventListener('cancel', rvResetDialog);

      if (rvForm) {
        rvForm.addEventListener('submit', function (e) {
          e.preventDefault();
          if (!rvValidate(rvForm)) return;

          rvSubmitBtn.disabled = true;
          rvSubmitBtn.textContent = 'Enviando…';

          var proto = cfg.prototipos[state.protoIdx] || {};
          var fields = [
            { name: 'firstname', value: rvForm.querySelector('[name="firstname"]').value.trim() },
            { name: 'lastname',  value: rvForm.querySelector('[name="lastname"]').value.trim()  },
            { name: 'email',     value: rvForm.querySelector('[name="email"]').value.trim()     },
            { name: 'phone',     value: rvForm.querySelector('[name="phone"]').value.trim()     },
            { name: 'que_prototipo_te_interesa_madeira', value: proto.nombre || '' }
          ];

          function showSuccess() {
            if (rvForm)    rvForm.hidden = true;
            if (rvSuccess) rvSuccess.hidden = false;
            rvSubmitBtn.disabled = false;
            rvSubmitBtn.textContent = cfg.btnEnviarTexto || 'Enviar';
          }

          if (!cfg.portalId || !cfg.formGuid) {
            console.warn('[Cotizador] Portal ID o Form GUID no configurados');
            showSuccess();
            return;
          }

          fetch('https://api.hsforms.com/submissions/v3/integration/submit/' + cfg.portalId + '/' + cfg.formGuid, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: fields,
              context: { pageUri: window.location.href, pageName: document.title }
            })
          })
          .then(function (res) {
            if (res.ok || res.status === 200) { showSuccess(); }
            else { throw new Error('HTTP ' + res.status); }
          })
          .catch(function (err) {
            console.error('[Cotizador] Error al enviar formulario:', err);
            rvSubmitBtn.disabled = false;
            rvSubmitBtn.textContent = cfg.btnEnviarTexto || 'Enviar';
            alert('Hubo un problema al enviar tus datos. Por favor intenta de nuevo.');
          });
        });
      }
    }

    /* ── Preseleccionar primer equipamiento si existe ────────── */
    if (cfg.equipamientos && cfg.equipamientos.length > 0) {
      state.equipSel = [0];
      var firstEquip = q('[data-equip="0"]');
      if (firstEquip) {
        firstEquip.classList.add('is-active');
        firstEquip.setAttribute('aria-checked', 'true');
        var icon = firstEquip.querySelector('.item-row__icon');
        if (icon) icon.classList.add('is-active');
      }
    }

    recalc();
  }

  /* ── Punto de entrada: espera a que el DOM esté listo ─────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
