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
      creditType:  'bancario',
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
      var tasa           = state.creditType === 'infonavit'
                           ? cfg.tasaInfonavit : cfg.tasaBancario;
      var pagoBase       = credito * (tasa / 100);

      q('[data-pago-base]').textContent       = mxn(pagoBase);
      q('[data-modelo-nombre]').textContent   = proto.nombre || '—';
      q('[data-inversion-total]').textContent = mxn(totalInversion);
      q('[data-enganche-monto]').textContent  = mxn(engancheMonto);
      q('[data-monto-credito]').textContent   = mxn(credito);
    }

    /* ── Tipo de crédito ─────────────────────────────────────── */
    qa('[data-credito]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.creditType = btn.getAttribute('data-credito');
        qa('[data-credito]').forEach(function (b) {
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
        var tasa      = state.creditType === 'infonavit' ? cfg.tasaInfonavit : cfg.tasaBancario;
        var pagoBase  = credito * (tasa / 100);

        var msg = [
          'Hola! Me interesa el prototipo *' + (proto.nombre || '') + '* de Real Madeira.',
          '',
          '📋 Mi simulación:',
          '• Crédito: ' + (state.creditType === 'bancario' ? 'Bancario' : 'Infonavit'),
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
        var tasa     = state.creditType === 'infonavit' ? cfg.tasaInfonavit : cfg.tasaBancario;
        var pago     = credito * (tasa / 100);
        var fecha    = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
        var tipoCredito = state.creditType === 'bancario' ? 'Bancario' : 'Infonavit';

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

        var win = window.open('', '_blank', 'width=700,height=600,noopener');
        win.document.write(html);
        win.document.close();
        win.focus();
        win.print();
      });
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
