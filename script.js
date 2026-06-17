/* =========================================================================
   script.js — Interactions générales
   -------------------------------------------------------------------------
   - Header sticky (état au scroll) + menu mobile burger
   - Slider Avant / Après (souris, tactile, clavier)
   - Simulateur de devis multi-étapes (construit à partir de config.js)
   - Modale / lightbox des réalisations (focus trap, Échap)
   - Carrousel de témoignages
   - Filtres de galerie (page réalisations)
   - Envoi des formulaires en AJAX (Formspree) + honeypot + live region
   - Année dynamique du footer
   ========================================================================= */
(function () {
  'use strict';

  const CFG = window.SITE_CONFIG || {};
  const $ = (s, c = document) => (c || document).querySelector(s);
  const $$ = (s, c = document) => Array.from((c || document).querySelectorAll(s));
  const euros = n => Math.round(n).toLocaleString('fr-FR') + ' €';

  /* =====================================================================
     1) HEADER STICKY + MENU MOBILE
  ===================================================================== */
  function initHeader() {
    const header = $('.header');
    if (header && !header.classList.contains('header--solid')) {
      const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    const burger = $('.burger');
    const menu = $('.mobile-menu');
    if (!burger || !menu) return;
    const toggle = (open) => {
      const isOpen = open ?? !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', isOpen);
      burger.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggle());
    $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => toggle(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) toggle(false); });
  }

  /* =====================================================================
     2) SLIDER AVANT / APRÈS
     Accessible : rôle slider, flèches clavier, souris et tactile.
  ===================================================================== */
  function initBeforeAfter() {
    $$('.ba').forEach(ba => {
      let dragging = false;
      const setPos = (pct) => {
        pct = Math.max(0, Math.min(100, pct));
        ba.style.setProperty('--pos', pct + '%');
        ba.setAttribute('aria-valuenow', Math.round(pct));
      };
      const fromEvent = (clientX) => {
        const r = ba.getBoundingClientRect();
        setPos(((clientX - r.left) / r.width) * 100);
      };
      // souris / tactile (Pointer Events)
      ba.addEventListener('pointerdown', e => { dragging = true; ba.setPointerCapture(e.pointerId); fromEvent(e.clientX); });
      ba.addEventListener('pointermove', e => { if (dragging) fromEvent(e.clientX); });
      ba.addEventListener('pointerup', () => { dragging = false; });
      ba.addEventListener('pointercancel', () => { dragging = false; });
      // clavier
      ba.setAttribute('tabindex', '0');
      ba.setAttribute('role', 'slider');
      ba.setAttribute('aria-valuemin', '0');
      ba.setAttribute('aria-valuemax', '100');
      ba.setAttribute('aria-label', 'Comparer avant et après — utilisez les flèches');
      setPos(50);
      ba.addEventListener('keydown', e => {
        const cur = parseFloat(ba.style.getPropertyValue('--pos')) || 50;
        if (e.key === 'ArrowLeft') { setPos(cur - 4); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { setPos(cur + 4); e.preventDefault(); }
        else if (e.key === 'Home') { setPos(0); e.preventDefault(); }
        else if (e.key === 'End') { setPos(100); e.preventDefault(); }
      });
    });
  }

  /* =====================================================================
     3) SIMULATEUR DE DEVIS (construit depuis config.js)
  ===================================================================== */
  function initSimulateur() {
    const root = $('#simulateur-card');
    const sim = CFG.simulateur;
    if (!root || !sim) return;

    const options = sim.options || [];
    const state = { surface: sim.surface.defaut, choix: {} };
    options.forEach(o => state.choix[o.id] = false);

    // total des étapes : surface + options + résultat
    const totalSteps = 1 + options.length + 1;
    let current = 0;

    // ---- construction du DOM ----
    const stepsHTML = [];

    // étape surface
    stepsHTML.push(`
      <div class="simu-step" data-step="0" role="group" aria-label="Surface du jardin">
        <div class="simu-q-icon"><i class="fa-solid fa-ruler-combined" aria-hidden="true"></i></div>
        <h3>Quelle est la surface de votre extérieur&nbsp;?</h3>
        <p class="simu-help">Faites glisser le curseur ou choisissez une tranche.</p>
        <div class="simu-surface__val"><span id="simu-surface-val">${state.surface}</span> <span>m²</span></div>
        <input type="range" class="simu-range" id="simu-surface" min="${sim.surface.min}" max="${sim.surface.max}" step="${sim.surface.pas}" value="${state.surface}" aria-label="Surface en mètres carrés">
        <div class="simu-chips" id="simu-chips">
          ${[80, 150, 300, 600].map(v => `<button type="button" class="simu-chip" data-surface="${v}">${v} m²</button>`).join('')}
        </div>
      </div>`);

    // étapes options
    options.forEach((o, i) => {
      stepsHTML.push(`
        <div class="simu-step" data-step="${i + 1}" role="group" aria-label="${o.label}">
          <div class="simu-q-icon"><i class="${o.icone}" aria-hidden="true"></i></div>
          <h3>${o.question}</h3>
          ${o.aide ? `<p class="simu-help">${o.aide}</p>` : ''}
          <div class="simu-choices" role="radiogroup" aria-label="${o.question}">
            <button type="button" class="simu-choice" data-opt="${o.id}" data-val="1" role="radio" aria-checked="false">
              <i class="fa-solid fa-check" aria-hidden="true"></i> Oui
            </button>
            <button type="button" class="simu-choice" data-opt="${o.id}" data-val="0" role="radio" aria-checked="false">
              <i class="fa-solid fa-xmark" aria-hidden="true"></i> Non
            </button>
          </div>
        </div>`);
    });

    // étape résultat + formulaire
    const action = root.dataset.formspree || '[[FORMSPREE_ENDPOINT]]';
    stepsHTML.push(`
      <div class="simu-step simu-result" data-step="${totalSteps - 1}" role="group" aria-label="Estimation">
        <div class="eyebrow eyebrow--center" style="justify-content:center">Votre estimation</div>
        <p class="simu-result__label">Votre projet est estimé entre</p>
        <div class="simu-result__range" id="simu-range" aria-live="polite">— <span class="sep">et</span> —</div>
        <div class="simu-recap" id="simu-recap"></div>
        <p class="simu-disclaimer">${sim.disclaimer}</p>
        <hr style="border:none;border-top:1px solid var(--c-creme-d);margin:1.6rem 0">
        <p style="font-weight:600;color:var(--c-foret);margin-bottom:1rem">Recevez le détail par un expert sous 24h&nbsp;:</p>
        <form class="js-form" action="${action}" method="POST" novalidate>
          <input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
          <input type="hidden" name="estimation" id="simu-hidden-estimation">
          <input type="hidden" name="détail_projet" id="simu-hidden-detail">
          <input type="hidden" name="_subject" value="Nouvelle demande de devis (simulateur) — [[NOM_ENTREPRISE]]">
          <div class="field-row">
            <div class="field"><label for="sf-prenom">Prénom</label><input id="sf-prenom" name="prénom" required></div>
            <div class="field"><label for="sf-tel">Téléphone</label><input id="sf-tel" name="téléphone" type="tel" required></div>
          </div>
          <div class="field"><label for="sf-email">Email</label><input id="sf-email" name="email" type="email" required></div>
          <div class="field"><label for="sf-msg">Votre message (facultatif)</label><textarea id="sf-msg" name="message" rows="2" placeholder="Précisez vos envies, vos délais…"></textarea></div>
          <button type="submit" class="btn btn--or btn--block btn--lg"><i class="fa-solid fa-paper-plane"></i> Recevoir mon devis détaillé</button>
          <p class="form-status" role="status" aria-live="polite"></p>
        </form>
      </div>`);

    root.innerHTML = `
      <div class="simu-progress"><div class="simu-progress__bar" id="simu-bar"></div></div>
      <div class="simu-meta"><span id="simu-step-label">Étape 1 / ${totalSteps}</span><span id="simu-step-name"></span></div>
      <div class="simu-steps" id="simu-steps">${stepsHTML.join('')}</div>
      <div class="simu-nav">
        <button type="button" class="simu-back" id="simu-back" disabled><i class="fa-solid fa-arrow-left"></i> Retour</button>
        <button type="button" class="btn btn--dark" id="simu-next">Continuer <i class="fa-solid fa-arrow-right"></i></button>
      </div>`;

    const stepEls = $$('.simu-step', root);
    const bar = $('#simu-bar', root);
    const stepLabel = $('#simu-step-label', root);
    const backBtn = $('#simu-back', root);
    const nextBtn = $('#simu-next', root);
    const nav = $('.simu-nav', root);

    function showStep(n) {
      n = Math.max(0, Math.min(totalSteps - 1, n));
      stepEls.forEach((el, i) => {
        el.classList.toggle('is-active', i === n);
        el.classList.toggle('is-prev', i < n);
      });
      current = n;
      bar.style.width = ((n + 1) / totalSteps * 100) + '%';
      stepLabel.textContent = `Étape ${n + 1} / ${totalSteps}`;
      backBtn.disabled = n === 0;
      // le bouton "Continuer" disparaît sur l'écran résultat (le form prend le relais)
      const isResult = n === totalSteps - 1;
      nextBtn.style.display = isResult ? 'none' : '';
      backBtn.style.visibility = isResult && n === 0 ? 'hidden' : 'visible';
      if (isResult) { computeResult(); nav.style.justifyContent = 'flex-start'; }
      else { nav.style.justifyContent = 'space-between'; }
    }

    // surface
    const range = $('#simu-surface', root);
    const surfVal = $('#simu-surface-val', root);
    range.addEventListener('input', () => {
      state.surface = parseInt(range.value, 10);
      surfVal.textContent = state.surface;
      $$('#simu-chips .simu-chip', root).forEach(c => c.classList.toggle('is-on', parseInt(c.dataset.surface, 10) === state.surface));
    });
    $$('#simu-chips .simu-chip', root).forEach(chip => {
      chip.addEventListener('click', () => { range.value = chip.dataset.surface; range.dispatchEvent(new Event('input')); });
    });

    // options oui/non (auto-avance)
    $$('.simu-choice', root).forEach(choice => {
      choice.addEventListener('click', () => {
        const id = choice.dataset.opt;
        const val = choice.dataset.val === '1';
        state.choix[id] = val;
        const group = choice.parentElement;
        $$('.simu-choice', group).forEach(c => {
          const on = c === choice;
          c.classList.toggle('is-selected', on);
          c.setAttribute('aria-checked', String(on));
        });
        setTimeout(() => showStep(current + 1), 260);
      });
    });

    nextBtn.addEventListener('click', () => showStep(current + 1));
    backBtn.addEventListener('click', () => showStep(current - 1));

    function computeResult() {
      const s = sim.surface;
      let min = state.surface * s.prixM2.min;
      let max = state.surface * s.prixM2.max;
      const recap = [`${state.surface} m²`];
      options.forEach(o => {
        if (state.choix[o.id]) { min += o.min; max += o.max; recap.push(o.label); }
      });
      // arrondi commercial au centaine
      min = Math.round(min / 100) * 100;
      max = Math.round(max / 100) * 100;

      // animation des montants
      animateMoney($('#simu-range', root), min, max);

      $('#simu-recap', root).innerHTML = recap.map(r => `<span>${r}</span>`).join('');
      $('#simu-hidden-estimation', root).value = `${euros(min)} – ${euros(max)}`;
      $('#simu-hidden-detail', root).value = recap.join(', ');
    }

    function animateMoney(el, min, max) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { el.innerHTML = `${euros(min)} <span class="sep">et</span> ${euros(max)}`; return; }
      const dur = 1100, start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.innerHTML = `${euros(min * e)} <span class="sep">et</span> ${euros(max * e)}`;
        if (p < 1) requestAnimationFrame(tick);
        else el.innerHTML = `${euros(min)} <span class="sep">et</span> ${euros(max)}`;
      })(start);
    }

    showStep(0);
  }

  /* =====================================================================
     4) MODALE / LIGHTBOX RÉALISATIONS
  ===================================================================== */
  function initModal() {
    const modal = $('#modal');
    if (!modal) return;
    const body = $('.modal__body', modal);
    let lastFocus = null;

    function openContent(html) {
      body.innerHTML = html;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lastFocus = document.activeElement;
      // gestion des miniatures (si présentes)
      const main = $('.modal__hero img', modal);
      $$('.modal__thumbs img', modal).forEach((th, i) => {
        th.addEventListener('click', () => {
          if (main) { main.src = th.src; main.alt = th.alt; }
          $$('.modal__thumbs img', modal).forEach(t => t.classList.remove('is-active'));
          th.classList.add('is-active');
        });
        if (i === 0) th.classList.add('is-active');
      });
      const focusables = $$('a, button, [tabindex]:not([tabindex="-1"])', modal).filter(el => el.offsetParent !== null);
      (focusables[0] || modal).focus();
    }
    const open = (tpl) => openContent(tpl.innerHTML);
    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      body.innerHTML = '';
      if (lastFocus) lastFocus.focus();
    }

    $$('[data-modal]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const tpl = $(trigger.dataset.modal);
        if (tpl) open(tpl);
      });
    });

    // Lightbox image simple (galerie page réalisations)
    $$('[data-lightbox]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const cap = trigger.dataset.caption || '';
        openContent(
          `<div class="modal__hero"><img src="${trigger.dataset.lightbox}" alt="${cap}"></div>` +
          (cap ? `<div class="modal__content" style="grid-template-columns:1fr"><div class="modal__detail"><h3>${cap}</h3></div></div>` : '')
        );
      });
    });
    modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.modal__close')) close(); });
    document.addEventListener('keydown', e => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const f = $$('a, button, input, textarea, [tabindex]:not([tabindex="-1"])', modal).filter(el => el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    });
  }

  /* =====================================================================
     5) CARROUSEL TÉMOIGNAGES
  ===================================================================== */
  function initCarousels() {
    $$('[data-carousel]').forEach(car => {
      const track = $('.carousel__track', car);
      const prev = $('[data-carousel-prev]', car);
      const next = $('[data-carousel-next]', car);
      const dotsWrap = $('[data-carousel-dots]', car);
      const slides = Array.from(track.children);
      let index = 0;

      function perView() {
        const cardW = slides[0].getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        const visible = Math.max(1, Math.round(car.querySelector('.carousel__viewport').offsetWidth / (cardW + gap)));
        return { cardW, gap, visible };
      }
      function maxIndex() { return Math.max(0, slides.length - perView().visible); }

      function update() {
        const { cardW, gap } = perView();
        index = Math.min(index, maxIndex());
        track.style.transform = `translateX(${-(index * (cardW + gap))}px)`;
        if (prev) prev.disabled = index === 0;
        if (next) next.disabled = index >= maxIndex();
        if (dotsWrap) {
          $$('.carousel__dot', dotsWrap).forEach((d, i) => d.classList.toggle('is-active', i === index));
        }
      }
      function go(i) { index = Math.max(0, Math.min(maxIndex(), i)); update(); }

      if (dotsWrap) {
        dotsWrap.innerHTML = '';
        for (let i = 0; i <= maxIndex(); i++) {
          const b = document.createElement('button');
          b.className = 'carousel__dot'; b.type = 'button';
          b.setAttribute('aria-label', `Aller au témoignage ${i + 1}`);
          b.addEventListener('click', () => go(i));
          dotsWrap.appendChild(b);
        }
      }
      prev && prev.addEventListener('click', () => go(index - 1));
      next && next.addEventListener('click', () => go(index + 1));

      // swipe tactile
      let startX = 0, swiping = false;
      track.addEventListener('pointerdown', e => { swiping = true; startX = e.clientX; });
      track.addEventListener('pointerup', e => {
        if (!swiping) return; swiping = false;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
      });
      window.addEventListener('resize', update);
      update();
    });
  }

  /* =====================================================================
     6) FILTRES GALERIE (page réalisations)
  ===================================================================== */
  function initFilters() {
    const wrap = $('[data-filters]');
    if (!wrap) return;
    const buttons = $$('.filter-btn', wrap);
    const items = $$('.gallery__item');
    wrap.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      buttons.forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
      const cat = btn.dataset.filter;
      items.forEach(item => {
        const show = cat === 'tout' || item.dataset.category === cat;
        item.classList.toggle('is-hidden', !show);
      });
    });
  }

  /* =====================================================================
     7) FORMULAIRES AJAX (Formspree) + honeypot + live region
  ===================================================================== */
  function initForms() {
    $$('.js-form').forEach(form => {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const status = $('.form-status', form);
        const honey = form.querySelector('.hp');
        if (honey && honey.value) { return; } // bot détecté : on ignore silencieusement

        const btn = form.querySelector('[type="submit"]');
        const action = form.getAttribute('action') || '';
        const setStatus = (msg, cls) => { if (status) { status.textContent = msg; status.className = 'form-status ' + (cls || ''); } };

        // Validation HTML5 minimale
        if (!form.checkValidity()) { form.reportValidity(); return; }

        if (btn) { btn.disabled = true; btn.dataset.label = btn.innerHTML; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Envoi en cours…'; }
        setStatus('', '');

        // Mode démo : tant que l'endpoint Formspree n'est pas configuré,
        // on simule un envoi réussi pour que le template reste testable.
        const notConfigured = action.includes('[[FORMSPREE_ENDPOINT]]') || action.trim() === '' || action.includes('VOTRE_ID');
        try {
          if (notConfigured) {
            await new Promise(r => setTimeout(r, 700));
            showSuccess(form);
            console.info('[Formspree] Endpoint non configuré — envoi simulé (mode démo). Renseignez [[FORMSPREE_ENDPOINT]].');
            return;
          }
          const res = await fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
          if (res.ok) { showSuccess(form); }
          else { setStatus('Une erreur est survenue. Réessayez ou appelez-nous directement.', 'is-err'); restore(btn); }
        } catch (err) {
          setStatus('Connexion impossible. Vérifiez votre réseau ou appelez-nous.', 'is-err');
          restore(btn);
        }
      });
    });

    function restore(btn) { if (btn) { btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label; } }
    function showSuccess(form) {
      const wrap = document.createElement('div');
      wrap.className = 'form-success';
      wrap.setAttribute('role', 'status');
      wrap.setAttribute('aria-live', 'polite');
      wrap.innerHTML = `
        <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
        <h3>Merci, c’est noté&nbsp;!</h3>
        <p>Votre demande a bien été envoyée. Un expert vous recontacte sous 24h.</p>`;
      form.replaceWith(wrap);
    }
  }

  /* =====================================================================
     8) DIVERS : année dynamique + ancres + fermeture menu
  ===================================================================== */
  function initMisc() {
    $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

    // Communes d'intervention (depuis config.js) — page contact
    const zonesWrap = $('[data-zones]');
    if (zonesWrap && Array.isArray(CFG.zones)) {
      zonesWrap.innerHTML = CFG.zones.map(z => `<span>${z}</span>`).join('');
    }
  }

  /* ---------------------------------------------------------------------
     INIT
  --------------------------------------------------------------------- */
  function init() {
    initHeader();
    initBeforeAfter();
    initSimulateur();
    initModal();
    initCarousels();
    initFilters();
    initForms();
    initMisc();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
