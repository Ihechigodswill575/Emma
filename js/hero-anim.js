// js/hero-anim.js
// Ocean wave canvas animation — pure JS, no GSAP, no libraries
// Words appear one by one during the animation
// Animation PAUSES when user scrolls past hero, RESUMES when they scroll back

(function () {
  'use strict';

  const hero      = document.getElementById('hero');
  const canvas    = document.getElementById('oceanCanvas');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  const words = document.querySelectorAll('.hw');

  // ─── Resize canvas to fill hero ───
  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ─── Wave config ───
  const waves = [
    { amp: 0.032, freq: 0.014, speed: 0.018, phase: 0,    alpha: 0.55, color: '#00BCD4', yFrac: 0.60 },
    { amp: 0.024, freq: 0.020, speed: 0.025, phase: 2.1,  alpha: 0.35, color: '#0097A7', yFrac: 0.68 },
    { amp: 0.018, freq: 0.026, speed: 0.030, phase: 4.5,  alpha: 0.25, color: '#006978', yFrac: 0.73 },
    { amp: 0.040, freq: 0.010, speed: 0.012, phase: 1.2,  alpha: 0.15, color: '#00BCD4', yFrac: 0.55 },
    { amp: 0.012, freq: 0.034, speed: 0.040, phase: 3.3,  alpha: 0.20, color: '#4DD0E1', yFrac: 0.78 },
  ];

  // ─── Particles (sea foam / bubbles) ───
  const PARTICLE_COUNT = window.innerWidth < 768 ? 30 : 60;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => makeParticle());

  function makeParticle() {
    return {
      x: Math.random(),        // fraction of width
      y: 0.45 + Math.random() * 0.4,
      r: 1 + Math.random() * 2.5,
      speed: 0.0002 + Math.random() * 0.0004,
      alpha: 0.1 + Math.random() * 0.3,
      drift: (Math.random() - 0.5) * 0.0003,
    };
  }

  // ─── State ───
  let t         = 0;
  let running   = true; // paused by IntersectionObserver when out of view
  let rafId     = null;
  let introPhase = true; // first ~2.5s — ocean builds up, then text appears

  // ─── Word reveal timing ───
  const wordRevealTimes = [0.8, 1.4, 2.0, 2.6, 3.2]; // seconds after start
  const wordRevealed = Array(words.length).fill(false);
  let startTime = null;

  // ─── Content reveal (hero text appears after ocean is established) ───
  let contentRevealed = false;
  const CONTENT_REVEAL_TIME = 3.8; // seconds

  function revealContent() {
    if (contentRevealed) return;
    contentRevealed = true;

    const eyebrow = document.getElementById('heroEyebrow');
    const line1   = document.getElementById('hLine1');
    const line2   = document.getElementById('hLine2');
    const sub     = document.getElementById('heroSub');
    const cta     = document.getElementById('heroCta');
    const hint    = document.getElementById('scrollHint');

    const items = [eyebrow, line1, line2, sub, cta, hint];
    items.forEach((el, i) => {
      if (!el) return;
      setTimeout(() => {
        el.classList.add('show');
      }, i * 180);
    });
  }

  // ─── Draw a single wave ───
  function drawWave(wave, elapsed) {
    const W = canvas.width;
    const H = canvas.height;
    const baseY = H * wave.yFrac;
    const amp   = H * wave.amp * Math.min(1, elapsed / 1.5); // grow in during first 1.5s

    ctx.beginPath();
    ctx.moveTo(0, H);

    for (let x = 0; x <= W; x += 3) {
      const y = baseY + Math.sin(x * wave.freq + wave.phase + t * wave.speed * 60) * amp
                      + Math.sin(x * wave.freq * 0.5 + t * wave.speed * 40) * amp * 0.4;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(W, H);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, baseY - amp, 0, H);
    grad.addColorStop(0,   hexAlpha(wave.color, wave.alpha * Math.min(1, elapsed / 1.5)));
    grad.addColorStop(0.5, hexAlpha(wave.color, wave.alpha * 0.5));
    grad.addColorStop(1,   hexAlpha(wave.color, 0.04));
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function hexAlpha(hex, a) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  // ─── Draw particles ───
  function drawParticles(elapsed) {
    const W = canvas.width;
    const H = canvas.height;
    const alpha = Math.min(1, elapsed / 2);

    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < 0.38) { Object.assign(p, makeParticle()); p.y = 0.82; }

      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,188,212,${p.alpha * alpha})`;
      ctx.fill();
    });
  }

  // ─── Glow / depth gradient beneath waves ───
  function drawDepth() {
    const W = canvas.width;
    const H = canvas.height;
    const grad = ctx.createLinearGradient(0, H * 0.5, 0, H);
    grad.addColorStop(0, 'rgba(0,21,31,0.0)');
    grad.addColorStop(1, 'rgba(0,21,31,0.72)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, H * 0.5, W, H * 0.5);
  }

  // ─── Main loop ───
  function frame(ts) {
    if (!startTime) startTime = ts;
    const elapsed = (ts - startTime) / 1000; // seconds

    t = elapsed;

    const W = canvas.width;
    const H = canvas.height;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Background sky gradient (deep ocean night → dark horizon)
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0,   'rgba(4,8,16,0.0)');    // transparent — lets Three.js particles show
    sky.addColorStop(0.6, 'rgba(0,12,22,0.25)');
    sky.addColorStop(1,   'rgba(0,28,42,0.5)');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Draw waves back to front
    [...waves].reverse().forEach(w => drawWave(w, elapsed));

    // Depth gradient
    drawDepth();

    // Particles
    drawParticles(elapsed);

    // Reveal floating words one by one
    words.forEach((word, i) => {
      if (!wordRevealed[i] && elapsed >= wordRevealTimes[i]) {
        wordRevealed[i] = true;
        word.classList.add('visible');
      }
    });

    // Reveal hero content
    if (!contentRevealed && elapsed >= CONTENT_REVEAL_TIME) {
      revealContent();
    }

    if (running) {
      rafId = requestAnimationFrame(frame);
    }
  }

  // ─── Start ───
  rafId = requestAnimationFrame(frame);

  // ─── Pause / resume based on hero visibility ───
  // IntersectionObserver: pauses when hero fully out of view, resumes when back
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Hero is in view — resume
        if (!running) {
          running = true;
          rafId = requestAnimationFrame(frame);
        }
        // Also resume word drift animations via CSS
        words.forEach(w => { w.style.animationPlayState = 'running'; });
      } else {
        // Hero out of view — pause
        running = false;
        cancelAnimationFrame(rafId);
        // Pause CSS drift animations
        words.forEach(w => { w.style.animationPlayState = 'paused'; });
      }
    });
  }, { threshold: 0.01 });

  observer.observe(hero);

  // ─── If user lands with hero in view but already slightly scrolled (edge case) ───
  window.addEventListener('scroll', () => {
    // Reveal content immediately if user scrolled before animation finished
    if (!contentRevealed && window.scrollY > 50) {
      revealContent();
      words.forEach(w => w.classList.add('visible'));
    }
  }, { once: true });

})();
