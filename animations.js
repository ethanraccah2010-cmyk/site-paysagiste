/* =========================================================================
   animations.js — Effets « presque 3D » et micro-interactions
   -------------------------------------------------------------------------
   Contenu :
   - Détection prefers-reduced-motion (tout est désactivable)
   - Reveals au scroll (IntersectionObserver)
   - Compteurs count-up
   - Parallax multi-couches
   - Cartes tilt 3D + reflet (réalisations)
   - Boutons « magnétiques » + halo qui suit la souris
   - Timeline du processus (ligne de progression au scroll)
   - Particules de feuilles dans le hero (canvas, GPU-friendly)
   - Curseur custom discret (desktop uniquement)

   ⚠️ Tous les réglages numériques viennent de config.js (window.SITE_CONFIG).
   ========================================================================= */
(function () {
  'use strict';

  const CFG = (window.SITE_CONFIG && window.SITE_CONFIG.animation) || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------------------------------------------------------------------
     1) REVEALS AU SCROLL
     Ajoute la classe .is-visible quand l'élément entre dans le viewport.
     Les délais séquencés se règlent via l'attribut data-reveal-delay (ms)
     ou automatiquement entre frères porteurs de data-reveal-stagger.
  --------------------------------------------------------------------- */
  function initReveals() {
    const items = $$('[data-reveal]');
    if (reduceMotion) { items.forEach(el => el.classList.add('is-visible')); return; }

    // Stagger automatique : applique un délai croissant aux enfants directs.
    $$('[data-reveal-stagger]').forEach(group => {
      const step = parseInt(group.dataset.revealStagger, 10) || 90;
      Array.from(group.children).forEach((child, i) => {
        if (child.hasAttribute('data-reveal')) {
          child.style.setProperty('--reveal-delay', (i * step) + 'ms');
        }
      });
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.revealDelay;
          if (delay) el.style.setProperty('--reveal-delay', delay + 'ms');
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------------------
     2) COMPTEURS COUNT-UP
     Élément : <span data-count="250" data-suffix="+"> ... </span>
     data-decimals pour les notes type 4,9 (virgule française).
  --------------------------------------------------------------------- */
  function animateCount(el) {
    const target = parseFloat(String(el.dataset.count).replace(',', '.'));
    const decimals = parseInt(el.dataset.decimals, 10) || 0;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = CFG.countUpDuree || 1600;
    // Token non remplacé (ex. « [[NOTE_GOOGLE]] ») : on affiche le texte brut.
    if (isNaN(target)) { el.textContent = prefix + el.dataset.count + suffix; return; }
    if (reduceMotion) { el.textContent = prefix + format(target, decimals) + suffix; return; }
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = prefix + format(target * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + format(target, decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }
  function format(n, decimals) {
    return decimals > 0
      ? n.toFixed(decimals).replace('.', ',')
      : Math.round(n).toLocaleString('fr-FR');
  }
  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateCount(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------------------
     3) PARALLAX MULTI-COUCHES
     Élément : data-parallax="0.2" (vitesse relative ; négatif = sens inverse)
     Utilise requestAnimationFrame + transform translateY (GPU).
  --------------------------------------------------------------------- */
  function initParallax() {
    const layers = $$('[data-parallax]');
    if (reduceMotion || !layers.length) return;
    let ticking = false;
    const base = CFG.parallaxIntensite || 0.18;

    function update() {
      const vh = window.innerHeight;
      layers.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -vh || rect.top > vh * 2) return; // hors champ
        const speed = parseFloat(el.dataset.parallax) || base;
        const center = rect.top + rect.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0)`;
      });
      ticking = false;
    }
    function onScroll() {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------------------------------------------------------------
     4) CARTES TILT 3D + REFLET (réalisations)
     Désactivé en reduced-motion ET sur écran tactile.
  --------------------------------------------------------------------- */
  function initTilt() {
    const cards = $$('[data-tilt]');
    if (reduceMotion || isTouch || !cards.length) return;
    const MAX = CFG.tiltMax || 9;

    cards.forEach(card => {
      let raf = null;
      function onMove(e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;   // 0 → 1
        const py = (e.clientY - r.top) / r.height;
        const ry = (px - 0.5) * (MAX * 2);
        const rx = (0.5 - py) * (MAX * 2);
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
          card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
          card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
        });
      }
      function reset() {
        if (raf) cancelAnimationFrame(raf);
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
      }
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', reset);
    });
  }

  /* ---------------------------------------------------------------------
     5) BOUTONS MAGNÉTIQUES + HALO
     - Halo (var --mx/--my) sur tous les .btn.
     - Léger déplacement « magnétique » sur les boutons data-magnetic.
  --------------------------------------------------------------------- */
  function initMagnetic() {
    $$('.btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        btn.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    if (reduceMotion || isTouch) return;
    $$('[data-magnetic]').forEach(btn => {
      const strength = parseFloat(btn.dataset.magnetic) || 0.3;
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------------------
     6) TIMELINE DU PROCESSUS
     Remplit la ligne de progression (--progress de 0 à 1) à mesure que la
     section traverse le viewport, et active les étapes une à une.
  --------------------------------------------------------------------- */
  function initProcess() {
    const process = document.querySelector('[data-process]');
    if (!process) return;
    const steps = $$('.process__step', process);
    if (reduceMotion) {
      process.style.setProperty('--progress', '1');
      steps.forEach(s => s.classList.add('is-active'));
      return;
    }
    let ticking = false;
    function update() {
      const rect = process.getBoundingClientRect();
      const vh = window.innerHeight;
      // progression : 0 quand la section arrive, 1 quand elle a presque fini
      const total = rect.height + vh * 0.5;
      let p = (vh * 0.85 - rect.top) / total;
      p = Math.max(0, Math.min(1, p));
      process.style.setProperty('--progress', p.toFixed(3));
      const active = Math.round(p * steps.length);
      steps.forEach((s, i) => s.classList.toggle('is-active', i < Math.max(1, active)));
      ticking = false;
    }
    function onScroll() { if (!ticking) { requestAnimationFrame(update); ticking = true; } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------------------------------------------------------------
     7) FEUILLES FLOTTANTES (canvas dans le hero)
     GPU-friendly : un seul canvas, requestAnimationFrame, peu de particules.
  --------------------------------------------------------------------- */
  function initLeaves() {
    const canvas = document.getElementById('hero-leaves');
    if (!canvas || reduceMotion || CFG.feuilles === false) return;
    const ctx = canvas.getContext('2d');
    let w, h, leaves, raf, running = true;
    const COUNT = CFG.feuillesDensite || 14;
    const COLORS = ['#7C8A5E', '#C9A86A', '#9aa776', '#5f7f5a'];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function makeLeaf() {
      return {
        x: Math.random() * w,
        y: Math.random() * -h,
        size: 6 + Math.random() * 10,
        speedY: 0.3 + Math.random() * 0.8,
        drift: (Math.random() - 0.5) * 0.6,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        sway: Math.random() * Math.PI * 2,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        opacity: 0.35 + Math.random() * 0.4
      };
    }
    function drawLeaf(l) {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot);
      ctx.globalAlpha = l.opacity;
      ctx.fillStyle = l.color;
      ctx.beginPath();
      ctx.moveTo(0, -l.size);
      ctx.quadraticCurveTo(l.size * 0.7, 0, 0, l.size);
      ctx.quadraticCurveTo(-l.size * 0.7, 0, 0, -l.size);
      ctx.fill();
      ctx.restore();
    }
    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      leaves.forEach(l => {
        l.sway += 0.01;
        l.y += l.speedY;
        l.x += l.drift + Math.sin(l.sway) * 0.5;
        l.rot += l.rotSpeed;
        if (l.y > h + 20) { Object.assign(l, makeLeaf(), { y: -20 }); }
        drawLeaf(l);
      });
      raf = requestAnimationFrame(tick);
    }
    resize();
    leaves = Array.from({ length: COUNT }, makeLeaf);
    tick();
    window.addEventListener('resize', resize);
    // Pause quand le hero n'est plus visible (économie de batterie)
    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running) { tick(); } else if (raf) { cancelAnimationFrame(raf); }
    }, { threshold: 0 });
    io.observe(canvas);
  }

  /* ---------------------------------------------------------------------
     8) CURSEUR CUSTOM (desktop, discret)
  --------------------------------------------------------------------- */
  function initCursor() {
    if (reduceMotion || isTouch || window.innerWidth < 1024) return;
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    document.body.classList.add('has-cursor');

    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', e => {
      if (e.target.closest('a, button, [data-tilt], .ba, input, textarea')) ring.classList.add('is-hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('a, button, [data-tilt], .ba, input, textarea')) ring.classList.remove('is-hover');
    });
  }

  /* ---------------------------------------------------------------------
     INITIALISATION
  --------------------------------------------------------------------- */
  /* ---------------------------------------------------------------------
     0) HERO EN MOUVEMENT RÉDUIT
     prefers-reduced-motion : la vidéo du hero devient une image fixe (poster).
  --------------------------------------------------------------------- */
  function initHeroMotion() {
    if (!reduceMotion) return;
    const video = document.querySelector('.hero__media video');
    if (!video) return;
    const img = document.createElement('img');
    img.src = video.getAttribute('poster') || '';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    video.replaceWith(img);
  }

  function init() {
    initHeroMotion();
    initReveals();
    initCounters();
    initParallax();
    initTilt();
    initMagnetic();
    initProcess();
    initLeaves();
    initCursor();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
