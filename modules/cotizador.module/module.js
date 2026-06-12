/* ============================================================
   COTIZADOR DE VIVIENDA — Real Madeira
   Fórmula (Excel Simulador Mensualidad):
     Mensualidad = (Precio − Enganche) × Tasa%
     Mensualidad Real = Mensualidad − Ahorro EDGE
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
      var pagoReal       = pagoBase - cfg.ahorroEdge;

      q('[data-pago-base]').textContent        = mxn(pagoBase);
      q('[data-modelo-nombre]').textContent    = proto.nombre || '—';
      q('[data-inversion-total]').textContent  = mxn(totalInversion);
      q('[data-enganche-monto]').textContent   = mxn(engancheMonto);
      q('[data-mensualidad-real]').textContent = mxn(pagoReal);
      q('[data-ahorro-edge]').textContent      = '−' + mxn(cfg.ahorroEdge) + '/MES';
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
        var pagoReal  = pagoBase - cfg.ahorroEdge;

        var msg = [
          'Hola! Me interesa el prototipo *' + (proto.nombre || '') + '* de Real Madeira.',
          '',
          '📋 Mi simulación:',
          '• Crédito: ' + (state.creditType === 'bancario' ? 'Bancario' : 'Infonavit'),
          '• Inversión Total: ' + mxn(total),
          '• Enganche (' + engPct + '%): ' + mxn(engMonto),
          '• Pago mensual: ' + mxn(pagoBase),
          '• Mensualidad real (ahorro EDGE): ' + mxn(pagoReal),
          '',
          '¿Podrían contactarme para más información?'
        ].join('\n');

        window.open('https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      });
    }

    /* ── Descargar PDF ───────────────────────────────────────── */
    var pdfBtn = q('[data-pdf-btn]');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', function () { window.print(); });
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
