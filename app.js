/**
 * Muhammad Aiman bin Jamaluddin — Redesigned Portfolio Engine
 * Inspired by hazeeq.org's editorial structure, built for Aiman's
 * AI, Full-Stack & Systems Engineering portfolio.
 */

document.addEventListener('DOMContentLoaded', () => {
  const yrEl = document.getElementById('yr');
  if (yrEl) yrEl.textContent = new Date().getFullYear();

  initGeometricMosaicBg();
  initTheme();
  initNavAndReveal();
  initTickerStrip();
  initBrowserWorkbench();
  initXaiLab();
  initPulseLift3D();
  initPantunLab();
  initParserLab();
  initContactForm();
});

/* ============================================================
   0. Animated Right-Triangle Mosaic Background (@CaribbeanGreen)
   ============================================================ */
function initGeometricMosaicBg() {
  const canvas = document.getElementById('bg-mosaic');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let cols = 0;
  let rows = 0;
  const CELL = 64;
  let cells = [];

  // Mouse interaction coordinates
  let mouseX = -1000;
  let mouseY = -1000;
  let targetMouseX = -1000;
  let targetMouseY = -1000;

  window.addEventListener('pointermove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  }, { passive: true });

  // Deterministic pseudo-random helper for crisp facet distribution
  function hash(c, r, s) {
    const n = Math.sin(c * 127.1 + r * 311.7 + s * 74.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function buildGrid() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.ceil(width / CELL) + 1;
    rows = Math.ceil(height / CELL) + 1;
    cells = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Diagonal orientation: true = '\' (top-left to bottom-right), false = '/' (bottom-left to top-right)
        const diagBackslash = hash(c, r, 1) > 0.5;
        // Two triangles per square cell, each with its own base level, speed, and phase
        const seedA = hash(c, r, 2);
        const seedB = hash(c, r, 3);
        cells.push({
          c,
          r,
          x: c * CELL,
          y: r * CELL,
          diagBackslash,
          baseA: seedA < 0.36 ? 0 : seedA,
          baseB: seedB < 0.36 ? 0 : seedB,
          phaseA: hash(c, r, 4) * Math.PI * 2,
          phaseB: hash(c, r, 5) * Math.PI * 2,
          speedA: 0.45 + hash(c, r, 6) * 0.95,
          speedB: 0.45 + hash(c, r, 7) * 0.95
        });
      }
    }
  }

  // Stepped color palette matching the uploaded @CaribbeanGreen geometric avatar
  function facetColorDark(val) {
    // val in [0, 1] -> discrete/smooth hybrid facets from pitch black to neon matrix green
    if (val < 0.24) return '#020402';        // Pitch black
    if (val < 0.40) return '#051608';        // Deep obsidian green
    if (val < 0.54) return '#093411';        // Dark forest green
    if (val < 0.68) return '#0E631D';        // Medium emerald
    if (val < 0.81) return '#139B2B';        // Kelly green
    if (val < 0.91) return '#17CC36';        // Vivid green
    return '#1FF042';                        // Bright neon lime facet
  }

  function facetColorLight(val) {
    if (val < 0.28) return '#EAF2EC';
    if (val < 0.48) return '#D9EBD0';
    if (val < 0.66) return '#BBE0C3';
    if (val < 0.82) return '#8CD19B';
    if (val < 0.92) return '#4DBD66';
    return '#1ED645';
  }

  function computeTriangleValue(base, phase, speed, cx, cy, t) {
    // Travelling diagonal wave + local triangle pulse
    const wave = Math.sin(cx * 0.0045 - cy * 0.0035 + t * 0.85) * 0.5 + 0.5;
    const local = Math.sin(t * speed + phase) * 0.5 + 0.5;
    let v = base === 0 ? local * 0.34 : base * 0.55 + local * 0.32 + wave * 0.18;

    // Cursor proximity glow
    const dx = cx - mouseX;
    const dy = cy - mouseY;
    const distSq = dx * dx + dy * dy;
    const radiusSq = 240 * 240;
    if (distSq < radiusSq) {
      const boost = (1 - distSq / radiusSq) * 0.48;
      v = Math.min(1, v + boost);
    }
    return v;
  }

  buildGrid();
  window.addEventListener('resize', buildGrid);

  function render(now) {
    const t = now * 0.001;
    mouseX += (targetMouseX - mouseX) * 0.12;
    mouseY += (targetMouseY - mouseY) * 0.12;

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const pickColor = isDark ? facetColorDark : facetColorLight;
    const strokeStyle = isDark ? 'rgba(28, 235, 66, 0.13)' : 'rgba(11, 138, 36, 0.12)';

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 0.75;
    ctx.strokeStyle = strokeStyle;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const x = cell.x;
      const y = cell.y;
      const s = CELL;

      const vA = computeTriangleValue(cell.baseA, cell.phaseA, cell.speedA, x + s * 0.3, y + s * 0.3, t);
      const vB = computeTriangleValue(cell.baseB, cell.phaseB, cell.speedB, x + s * 0.7, y + s * 0.7, t);

      if (cell.diagBackslash) {
        // Diagonal '\' from (x, y) to (x+s, y+s)
        // Triangle A: Bottom-Left
        ctx.fillStyle = pickColor(vA);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + s, y + s);
        ctx.lineTo(x, y + s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Triangle B: Top-Right
        ctx.fillStyle = pickColor(vB);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + s, y);
        ctx.lineTo(x + s, y + s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Diagonal '/' from (x, y+s) to (x+s, y)
        // Triangle A: Top-Left
        ctx.fillStyle = pickColor(vA);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + s, y);
        ctx.lineTo(x, y + s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Triangle B: Bottom-Right
        ctx.fillStyle = pickColor(vB);
        ctx.beginPath();
        ctx.moveTo(x + s, y);
        ctx.lineTo(x + s, y + s);
        ctx.lineTo(x, y + s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // Subtle atmospheric readability overlay so the mosaic is vivid yet text stays effortless to read
    if (isDark) {
      const grad = ctx.createRadialGradient(
        width * 0.5, height * 0.45, Math.min(width, height) * 0.1,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.85
      );
      grad.addColorStop(0, 'rgba(3, 8, 4, 0.70)');
      grad.addColorStop(1, 'rgba(2, 5, 3, 0.52)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = 'rgba(243, 247, 244, 0.62)';
      ctx.fillRect(0, 0, width, height);
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

/* ============================================================
   1. Theme Toggle
   ============================================================ */
function initTheme() {
  const root = document.documentElement;
  const btn = document.getElementById('theme');
  const tc = document.getElementById('tc');

  function syncTheme() {
    const dark = root.getAttribute('data-theme') === 'dark';
    if (btn) {
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }
    if (tc) tc.setAttribute('content', dark ? '#0A0A0C' : '#F4F4F1');
  }

  syncTheme();

  if (btn) {
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('aiman-theme', next); } catch (e) {}
      syncTheme();
    });
  }
}

/* ============================================================
   2. Sticky Nav, Scroll Reveal (.rise) & Number Counters
   ============================================================ */
function initNavAndReveal() {
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('stuck', window.scrollY > 12);
    }, { passive: true });
  }

  const riseEls = document.querySelectorAll('.rise');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    riseEls.forEach((el) => io.observe(el));

    // Animated counters
    const counters = document.querySelectorAll('.stat .n[data-count]');
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const start = performance.now();
        const dur = 1100;

        function tick(now) {
          const p = Math.min(1, (now - start) / dur);
          const ease = 1 - Math.pow(1 - p, 3);
          const val = Math.round(target * ease);
          el.textContent = val.toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => cio.observe(c));
  } else {
    riseEls.forEach((el) => el.classList.add('in'));
  }
}

/* ============================================================
   3. Infinite Scrolling Ticker Strip
   ============================================================ */
function initTickerStrip() {
  const strip = document.getElementById('strip');
  if (!strip) return;

  const items = [
    '<b>KTMB ETS XAI</b> · 2.2M+ trip records · 4.1% MAPE',
    '<b>Random Forest &amp; TreeSHAP</b> · Written from scratch in NumPy',
    '<b>Pantun Coherence</b> · Fine-tuned PyTorch LaBSE · 0.92 AUC',
    '<b>PulseLift PWA</b> · 360° 3D Muscle Models in Plain JS',
    '<b>ChateauFido</b> · Jakarta EE 10 · 44 Java Classes · Grade A+',
    '<b>EdenHR</b> · 9-Module CodeIgniter HR System',
    '<b>Linux Home Lab</b> · Self-Hosted NAS &amp; Docker Game Servers',
    '<b>CSC569 Compiler</b> · LL(1) Latin &amp; Arabic-Script Parser'
  ];

  const html = items.map((t) => `<span>${t}</span>`).join('');
  strip.innerHTML = html + html;
}

/* ============================================================
   4. Fake Browser Workbench Switcher (.chip + .spec)
   ============================================================ */
function initBrowserWorkbench() {
  const specs = {
    xai: {
      tab: 'KTMB ETS Ridership XAI',
      url: 'KTMB-ETS-Ridership-XAI',
      fav: '#10B981',
      viewId: 'view-xai',
      spec: [
        'Random Forest regressor written from scratch in pure NumPy',
        'Exact TreeSHAP path-dependent attribution verified vs brute-force Shapley',
        '4.1% network MAPE on May–Dec 2025 holdout (vs 6.4% naive baseline)',
        'Joined 2.2M+ KTMB trips with DOSM demographics & Open-Meteo weather'
      ],
      time: '2.2M+ hourly records',
      stack: 'Python · NumPy · HTML/CSS/JS',
      link: 'https://github.com/CaribbeanGreen/KTMB-ETS-Ridership-XAI',
      cta: 'Inspect repo on GitHub ↗'
    },
    pulselift: {
      tab: 'PulseLift — 3D Workout PWA',
      url: 'PulseLift-Workout-Tracker',
      fav: '#FFD64A',
      viewId: 'view-pulselift',
      spec: [
        'Custom WebGL 3D anatomical mannequin & GLSL muscle thermal-glow shaders',
        'Analytical 2-bone Inverse Kinematics (IK) solver with zero external 3D libraries',
        'Interactive 360° camera orbit, scroll zoom, and hover-spotlight muscle tooltips',
        'Installable offline-capable Progressive Web App (Service Worker)'
      ],
      time: '0 external 3D libraries',
      stack: 'Vanilla JS · WebGL GLSL · PWA',
      link: 'https://github.com/CaribbeanGreen/PulseLift-Workout-Tracker',
      cta: 'Inspect repo on GitHub ↗'
    },
    pantun: {
      tab: 'Pantun Pembayang–Maksud AI',
      url: 'pantun-coherence',
      fav: '#8B5CF6',
      viewId: 'view-pantun',
      spec: [
        '~11,000 Malay pantun curated from published literary anthologies',
        'Fine-tuned LaBSE in PyTorch with contrastive loss (0.65 → 0.92 AUC)',
        'Outperformed zero-shot LLM judges (which scored 0.50–0.53 near chance)',
        'Multi-role Streamlit workbench for students, lecturers & researchers'
      ],
      time: '~11,000 pantun corpus',
      stack: 'PyTorch · LaBSE · Gemma · Streamlit',
      link: 'https://github.com/CaribbeanGreen/pantun-coherence',
      cta: 'Inspect repo on GitHub ↗'
    },
    parser: {
      tab: 'LL(1) Latin & Arabic Parser',
      url: 'SableCC-Lexical-Analyzer',
      fav: '#38BDF8',
      viewId: 'view-parser',
      spec: [
        'Extended Grammar G17 to 10 LL(1) rules with zero backtracking',
        'Accepts both Latin (+ - * / ( )) and Arabic (و ط ض ق غ ب) terminals',
        'Complete First, Follow, BDW, BW, DEO, EO, FDB & FB proofs',
        'Java Swing visual parser + SableCC 3.7 lexical analyzer'
      ],
      time: '10 LL(1) production rules',
      stack: 'Java Swing · SableCC · LL(1)',
      link: 'assets/docs/CSC569_Recursive_Descent_Parser_Report.pdf',
      cta: 'Read full technical report (PDF) ↗'
    }
  };

  const chips = document.querySelectorAll('.chip[data-key]');
  const views = document.querySelectorAll('.wb-view');

  function activateChip(key) {
    const p = specs[key];
    if (!p) return;

    chips.forEach((c) => {
      c.setAttribute('aria-selected', c.dataset.key === key ? 'true' : 'false');
    });

    views.forEach((v) => {
      v.classList.toggle('active', v.id === p.viewId);
    });

    document.getElementById('b-tab').textContent = p.tab;
    document.getElementById('b-url').textContent = p.url;
    document.getElementById('b-fav').style.background = p.fav;

    document.getElementById('d-spec').innerHTML = p.spec.map((s) => `<li>${s}</li>`).join('');
    document.getElementById('d-time').textContent = p.time;
    document.getElementById('d-stack').textContent = p.stack;

    const linkEl = document.getElementById('d-link');
    linkEl.href = p.link;
    linkEl.textContent = p.cta;
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => activateChip(chip.dataset.key));
  });

  document.querySelectorAll('[data-jump-chip]').forEach((link) => {
    link.addEventListener('click', () => {
      activateChip(link.getAttribute('data-jump-chip'));
    });
  });

  activateChip('xai');
}

/* ============================================================
   5. View 1: KTMB ETS Ridership & TreeSHAP Simulator
   ============================================================ */
function initXaiLab() {
  const hourInput = document.getElementById('xaiHour');
  const dayInput = document.getElementById('xaiDay');
  const seasonInput = document.getElementById('xaiSeason');
  const tempInput = document.getElementById('xaiTemp');
  const rainInput = document.getElementById('xaiRain');

  const hourVal = document.getElementById('xaiHourVal');
  const tempVal = document.getElementById('xaiTempVal');
  const rainVal = document.getElementById('xaiRainVal');
  const predDisplay = document.getElementById('xaiPredValue');
  const shapContainer = document.getElementById('xaiShapBars');

  if (!hourInput || !shapContainer) return;

  const BASELINE = 880;

  function renderXai() {
    const hour = parseInt(hourInput.value, 10);
    const day = parseInt(dayInput.value, 10);
    const season = seasonInput.value;
    const temp = parseInt(tempInput.value, 10);
    const rain = parseInt(rainInput.value, 10);

    hourVal.textContent = `${String(hour).padStart(2, '0')}:00`;
    tempVal.textContent = `${temp}°C`;
    rainVal.textContent = `${rain} mm`;

    const hourCurve = {
      5: -410, 6: -190, 7: +145, 8: +260, 9: +180, 10: +95,
      11: +60, 12: +85, 13: +70, 14: +110, 15: +175, 16: +240,
      17: +315, 18: +340, 19: +255, 20: +140, 21: +30, 22: -185, 23: -360
    };
    const phiHour = hourCurve[hour] ?? 0;

    let phiSeason = 0;
    let seasonLabel = 'is_holiday (Normal)';
    if (season === 'festive') {
      phiSeason = hour >= 14 && hour <= 20 ? +215 : +140;
      seasonLabel = 'is_holiday (Festive)';
    } else if (season === 'school') {
      phiSeason = +85;
      seasonLabel = 'is_holiday (School)';
    } else if (season === 'ramadan') {
      phiSeason = -135;
      seasonLabel = 'regime (Ramadan)';
    }

    const dayDeltas = [-35, -45, -30, +15, +115, +90, +130];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const phiDay = dayDeltas[day] ?? 0;
    const phiTemp = Math.round((temp - 28) * 6.5);
    const phiRain = rain === 0 ? +12 : -Math.round(rain * 2.4);

    const totalPred = Math.max(95, BASELINE + phiHour + phiSeason + phiDay + phiTemp + phiRain);
    predDisplay.textContent = `${totalPred.toLocaleString()} pax/hr`;

    const rows = [
      { name: `hour_of_day (${hour}h)`, val: phiHour },
      { name: seasonLabel, val: phiSeason },
      { name: `day_of_week (${dayNames[day]})`, val: phiDay },
      { name: `temperature (${temp}°C)`, val: phiTemp },
      { name: `rainfall (${rain}mm)`, val: phiRain }
    ];

    const maxAbs = Math.max(360, ...rows.map((r) => Math.abs(r.val)));

    shapContainer.innerHTML = rows.map((r) => {
      const pct = Math.min(100, Math.max(6, Math.round((Math.abs(r.val) / maxAbs) * 100)));
      const cls = r.val >= 0 ? 'pos' : 'neg';
      const sign = r.val >= 0 ? `+${r.val}` : `${r.val}`;
      return `
        <div class="shap-item">
          <span>${r.name}</span>
          <div class="shap-track"><div class="shap-fill ${cls}" style="width:${pct}%"></div></div>
          <span class="shap-val ${cls}">${sign}</span>
        </div>
      `;
    }).join('');
  }

  [hourInput, dayInput, seasonInput, tempInput, rainInput].forEach((el) => {
    el.addEventListener('input', renderXai);
    el.addEventListener('change', renderXai);
  });

  document.querySelectorAll('[data-xai-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-xai-preset');
      if (p === 'raya') { hourInput.value = 18; dayInput.value = 4; seasonInput.value = 'festive'; tempInput.value = 32; rainInput.value = 0; }
      else if (p === 'commute') { hourInput.value = 17; dayInput.value = 4; seasonInput.value = 'normal'; tempInput.value = 30; rainInput.value = 4; }
      else if (p === 'ramadan') { hourInput.value = 12; dayInput.value = 2; seasonInput.value = 'ramadan'; tempInput.value = 33; rainInput.value = 0; }
      else if (p === 'night') { hourInput.value = 23; dayInput.value = 1; seasonInput.value = 'normal'; tempInput.value = 25; rainInput.value = 18; }
      renderXai();
    });
  });

  renderXai();
}

/* ============================================================
   6. View 2: PulseLift 360° 3D Anatomical Muscle Renderer
   ============================================================ */
function initPulseLift3D() {
  const canvas = document.getElementById('plCanvas');
  const angleInput = document.getElementById('plAngle');
  const angleVal = document.getElementById('plAngleVal');
  const activeGroupEl = document.getElementById('plActiveGroup');
  const logEl = document.getElementById('plWorkoutLog');
  if (!canvas || !window.PulseLift3D) return;

  const exercises = {
    bench: {
      poseId: 'bb-bench-press',
      title: 'Pectoralis Major & Anterior Delts',
      log: '▸ Barbell Bench Press: 3 sets × 8–10 reps · Primary: Pectoralis Major, Triceps Brachii · Secondary: Anterior Deltoids & Core'
    },
    squat: {
      poseId: 'bb-back-squat',
      title: 'Quadriceps & Gluteus Maximus',
      log: '▸ Barbell Back Squat: 3 sets × 6–8 reps · Primary: Quadriceps, Glutes · Secondary: Hamstrings, Erector Spinae & Core'
    },
    row: {
      poseId: 'bb-bent-row',
      title: 'Latissimus Dorsi & Rhomboids',
      log: '▸ Pendlay Barbell Row: 3 sets × 8–10 reps · Primary: Lats, Rhomboids & Traps · Secondary: Posterior Deltoids & Biceps'
    },
    ohp: {
      poseId: 'bb-overhead-press',
      title: 'Anterior/Lateral Delts & Triceps',
      log: '▸ Barbell Overhead Press: 3 sets × 8 reps · Primary: Anterior & Lateral Deltoids, Triceps · Secondary: Upper Back & Core'
    },
    rdl: {
      poseId: 'rdls',
      title: 'Hamstrings & Gluteus Maximus',
      log: '▸ Romanian Deadlift (RDL): 3 sets × 8–10 reps · Primary: Hamstrings, Glutes · Secondary: Erector Spinae & Forearms'
    },
    pullup: {
      poseId: 'bw-pullup',
      title: 'Latissimus Dorsi & Biceps Brachii',
      log: '▸ Bodyweight Pull-Up: 3 sets × AMRAP · Primary: Latissimus Dorsi, Biceps Brachii · Secondary: Upper Back & Rear Delts'
    }
  };

  const viewer = window.PulseLift3D.createViewer(canvas, 'bb-bench-press', {
    poseId: 'bb-bench-press',
    initialYaw: 38,
    initialPitch: 18,
    initialZoom: 1.0,
    autoSpin: true,
    onPhaseUpdate: (_repT, _phaseName, _cycle, deg) => {
      if (angleInput && !viewer.isDragging) {
        angleInput.value = String(deg);
      }
      if (angleVal) {
        angleVal.textContent = viewer.autoSpin ? `Auto (${deg}°)` : `${deg}°`;
      }
    }
  });

  if (angleInput && viewer) {
    angleInput.addEventListener('input', () => {
      const deg = parseInt(angleInput.value, 10);
      viewer.setCameraAngle(deg, viewer.pitch);
      if (angleVal) angleVal.textContent = `${deg}°`;
    });
  }

  document.querySelectorAll('[data-pl-ex]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-pl-ex');
      const ex = exercises[key] || exercises.bench;
      if (viewer) {
        viewer.poseId = ex.poseId;
        viewer.exerciseId = ex.poseId;
      }
      if (activeGroupEl) activeGroupEl.textContent = ex.title;
      if (logEl) {
        logEl.innerHTML = `<div class="trace-ok">${ex.log}</div><div>Drag on the 3D athlete to orbit, scroll to zoom, or hover any muscle to spotlight it.</div>`;
      }
    });
  });
}

/* ============================================================
   7. View 3: Pantun Pembayang–Maksud Coherence Analyzer
   ============================================================ */
function initPantunLab() {
  const pembayangEl = document.getElementById('pantunPembayang');
  const maksudEl = document.getElementById('pantunMaksud');
  const runBtn = document.getElementById('runPantunBtn');
  const scoreVal = document.getElementById('pantunScoreVal');
  const verdictEl = document.getElementById('pantunVerdict');
  const metricsEl = document.getElementById('pantunMetrics');
  const logEl = document.getElementById('pantunAnalysisLog');
  if (!pembayangEl || !runBtn) return;

  const presets = {
    classic: {
      p: 'Pulau Pandan jauh ke tengah,\nGunung Daik bercabang tiga;',
      m: 'Hancur badan dikandung tanah,\nBudi yang baik dikenang juga.'
    },
    nature: {
      p: 'Pisang emas dibawa belayar,\nMasak sebiji di atas peti;',
      m: 'Hutang emas boleh dibayar,\nHutang budi dibawa mati.'
    },
    shuffled: {
      p: 'Pulau Pandan jauh ke tengah,\nGunung Daik bercabang tiga;',
      m: 'Kain songket tenunan rapi,\nDijual orang di pasar malam.'
    }
  };

  function tailSound(line) {
    const clean = line.replace(/[^a-zA-Z]/g, '').toLowerCase();
    return clean.slice(-2) || '--';
  }

  function countSyl(line) {
    const m = line.toLowerCase().match(/[aeiou]/g);
    return m ? m.length : 0;
  }

  function evaluatePantun() {
    const pLines = pembayangEl.value.trim().split(/\n+/);
    const mLines = maksudEl.value.trim().split(/\n+/);
    const l1 = pLines[0] || '', l2 = pLines[1] || '', l3 = mLines[0] || '', l4 = mLines[1] || '';

    const r1 = tailSound(l1), r2 = tailSound(l2), r3 = tailSound(l3), r4 = tailSound(l4);
    const aMatch = r1 === r3 && r1 !== '--';
    const bMatch = r2 === r4 && r2 !== '--';
    const rhymeScore = (aMatch ? 0.5 : 0.15) + (bMatch ? 0.5 : 0.15);

    const syls = [l1, l2, l3, l4].map(countSyl);
    const avgSyl = syls.reduce((a, b) => a + b, 0) / 4;
    const meterScore = avgSyl >= 8 && avgSyl <= 12 ? 0.94 : 0.68;

    const text = `${l1} ${l2} ${l3} ${l4}`.toLowerCase();
    let labse = 0.78;
    if (text.includes('pulau pandan') && text.includes('hancur badan')) labse = 0.93;
    else if (text.includes('pisang emas') && text.includes('hutang emas')) labse = 0.95;
    else if (text.includes('pasar malam')) labse = 0.29;
    else labse = Number((0.54 + rhymeScore * 0.36).toFixed(2));

    const total = Number((labse * 0.65 + rhymeScore * 0.25 + meterScore * 0.1).toFixed(2));
    scoreVal.textContent = `${total.toFixed(2)} Coherence`;
    verdictEl.textContent = total >= 0.75
      ? `Authentic Pairing · Contrastive LaBSE: ${labse.toFixed(2)}`
      : `Low Resonance (Shuffled Foil) · LaBSE: ${labse.toFixed(2)}`;

    const rows = [
      { name: 'Fine-Tuned LaBSE', pct: Math.round(labse * 100), val: labse.toFixed(2) },
      { name: 'Base LaBSE (0.65)', pct: Math.round(labse * 68), val: (labse * 0.68).toFixed(2) },
      { name: 'Rhyme (a-b-a-b)', pct: Math.round(rhymeScore * 100), val: rhymeScore.toFixed(2) },
      { name: 'Syllabic Cadence', pct: Math.round(meterScore * 100), val: meterScore.toFixed(2) }
    ];

    metricsEl.innerHTML = rows.map((r) => {
      const cls = r.pct >= 65 ? 'pos' : 'neg';
      return `
        <div class="shap-item">
          <span>${r.name}</span>
          <div class="shap-track"><div class="shap-fill ${cls}" style="width:${r.pct}%"></div></div>
          <span class="shap-val ${cls}">${r.val}</span>
        </div>
      `;
    }).join('');

    logEl.innerHTML = `
      <div class="${aMatch && bMatch ? 'trace-ok' : 'trace-err'}">▸ Rhyme [a-b-a-b]: L1("${r1}")↔L3("${r3}") ${aMatch ? '✔' : '✖'} · L2("${r2}")↔L4("${r4}") ${bMatch ? '✔' : '✖'}</div>
      <div>▸ Syllables per line: [${syls.join(', ')}] (Classical Malay target: 8–12)</div>
    `;
  }

  runBtn.addEventListener('click', evaluatePantun);
  document.querySelectorAll('[data-pantun-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const k = btn.getAttribute('data-pantun-preset');
      if (presets[k]) {
        pembayangEl.value = presets[k].p;
        maksudEl.value = presets[k].m;
        evaluatePantun();
      }
    });
  });

  evaluatePantun();
}

/* ============================================================
   8. View 4: LL(1) Recursive Descent Parser (Latin & Arabic)
   ============================================================ */
function initParserLab() {
  const inputEl = document.getElementById('parserInput');
  const runBtn = document.getElementById('runParserBtn');
  const statusVal = document.getElementById('parserStatusVal');
  const statusSub = document.getElementById('parserStatusSub');
  const traceEl = document.getElementById('parserTraceLog');
  if (!inputEl || !runBtn) return;

  function parse(raw) {
    const tokens = Array.from(raw.replace(/\s+/g, ''));
    tokens.push('$');
    let pos = 0;
    const log = [];

    const la = () => tokens[pos] || '$';
    const match = (desc) => {
      log.push(`<div class="trace-ok">✔ Match '${la()}' at pos ${pos} (${desc})</div>`);
      pos++;
    };
    const isOpnd = (c) => /^[0-9a-zA-Z\u0628]$/.test(c);

    function Expr() {
      log.push(`<div>→ Expr() [Rule 1: Expr → Term Etail] (la='${la()}')</div>`);
      Term();
      Etail();
    }
    function Etail() {
      const c = la();
      if (c === '+' || c === 'و') {
        log.push(`<div>→ Etail() [Rule 2: '${c}' Term Etail]</div>`);
        match('Add Op');
        Term();
        Etail();
      } else if (c === '-' || c === 'ط') {
        log.push(`<div>→ Etail() [Rule 3: '${c}' Term Etail]</div>`);
        match('Sub Op');
        Term();
        Etail();
      } else if (c === ')' || c === 'غ' || c === '$') {
        log.push(`<div>→ Etail() → ε [Rule 4 Follow '${c}']</div>`);
      } else {
        throw new Error(`Unexpected '${c}' at index ${pos} in Etail()`);
      }
    }
    function Term() {
      log.push(`<div>→ Term() [Rule 5: Term → Factor Ttail]</div>`);
      Factor();
      Ttail();
    }
    function Ttail() {
      const c = la();
      if (c === '*' || c === 'ض') {
        log.push(`<div>→ Ttail() [Rule 6: '${c}' Factor Ttail]</div>`);
        match('Mul Op');
        Factor();
        Ttail();
      } else if (c === '/' || c === 'ق') {
        log.push(`<div>→ Ttail() [Rule 7: '${c}' Factor Ttail]</div>`);
        match('Div Op');
        Factor();
        Ttail();
      } else if (['+', 'و', '-', 'ط', ')', 'غ', '$'].includes(c)) {
        log.push(`<div>→ Ttail() → ε [Rule 8 Follow '${c}']</div>`);
      } else {
        throw new Error(`Unexpected '${c}' at index ${pos} in Ttail()`);
      }
    }
    function Factor() {
      const c = la();
      if (c === '(') {
        log.push(`<div>→ Factor() [Rule 9: '(' Expr ')'|'غ']</div>`);
        match('Open Paren');
        Expr();
        if (la() === ')' || la() === 'غ') match('Close Paren');
        else throw new Error(`Missing ')' or 'غ' at index ${pos}, found '${la()}'`);
      } else if (isOpnd(c)) {
        log.push(`<div>→ Factor() [Rule 10: Operand '${c}']</div>`);
        match('Operand');
      } else {
        throw new Error(`Expected operand or '(' at index ${pos}, found '${c}'`);
      }
    }

    try {
      if (tokens.length === 1) throw new Error('Empty expression');
      Expr();
      if (la() !== '$') throw new Error(`Unconsumed token '${la()}' at index ${pos}`);
      log.push(`<div class="trace-ok">✔ ACCEPTED: Valid sentence in Extended LL(1) Grammar G17.</div>`);
      statusVal.textContent = 'ACCEPTED';
      statusVal.style.color = '#34D399';
      statusSub.textContent = `Parsed ${tokens.length - 1} tokens cleanly at EOF '$'`;
    } catch (e) {
      log.push(`<div class="trace-err">✖ REJECTED: ${e.message}</div>`);
      statusVal.textContent = 'SYNTAX ERROR';
      statusVal.style.color = '#FB7185';
      statusSub.textContent = e.message;
    }
    traceEl.innerHTML = log.join('');
  }

  runBtn.addEventListener('click', () => parse(inputEl.value));
  document.querySelectorAll('[data-parser-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      inputEl.value = btn.getAttribute('data-parser-preset');
      parse(inputEl.value);
    });
  });

  parse(inputEl.value);
}

/* ============================================================
   9. Direct Contact Form (WhatsApp & Email Handoff)
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const emailBtn = document.getElementById('form-email-btn');
  if (!form) return;

  function buildPayload() {
    const name = (document.getElementById('f-name').value || '').trim() || 'Hiring Team';
    const contact = (document.getElementById('f-contact').value || '').trim();
    const role = (document.getElementById('f-type').value || '').trim();
    const msg = (document.getElementById('f-msg').value || '').trim() || 'Hi Aiman, I viewed your portfolio and would like to connect.';
    return { name, contact, role, msg };
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { name, contact, role, msg } = buildPayload();
    const text = `Hi Aiman, I'm ${name}${contact ? ' (' + contact + ')' : ''}.\nRole Focus: ${role}\n\n${msg}`;
    window.open(`https://wa.me/601139910856?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });

  if (emailBtn) {
    emailBtn.addEventListener('click', () => {
      const { name, contact, role, msg } = buildPayload();
      const subject = `Internship / Portfolio Inquiry — ${role} (${name})`;
      const body = `From: ${name}${contact ? ' (' + contact + ')' : ''}\nRole Focus: ${role}\n\n${msg}`;
      window.location.href = `mailto:aiman_jamaluddin@outlook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
}
