// js/lenis.js
// Lenis Smooth Scroll — loaded via CDN on each page

(function () {
  // Lenis is loaded via CDN script tag on pages that need it
  // If Lenis is not loaded (CDN failed), degrade gracefully
  if (typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
  });

  // Integrate with GSAP ScrollTrigger if available
  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
  }

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // Expose globally so other scripts can use it
  window.lenis = lenis;
})();
