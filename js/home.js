// js/home.js
import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// --- Navbar scroll effect ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// --- Mobile nav toggle ---
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// --- Footer year ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Reveal on scroll ---
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => obs.observe(el));
}

// --- Post Card Builder ---
function buildPostCard(post, large = false) {
  const { id, title, excerpt, category, imageUrl, publishedAt, readTime } = post;
  const date = publishedAt
    ? new Date(publishedAt.seconds * 1000).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : 'Recently';

  const imgHtml = imageUrl
    ? `<div class="post-card-img"><img src="${imageUrl}" alt="${title}" loading="lazy" /></div>`
    : `<div class="post-card-img-placeholder">${(title || 'E')[0]}</div>`;

  return `
    <article class="post-card reveal" onclick="window.location='post.html?id=${id}'">
      ${imgHtml}
      <div class="post-card-body">
        <div class="post-card-meta">
          <span class="post-tag">${category || 'General'}</span>
          <span class="post-date">${date}</span>
        </div>
        <h3 class="post-card-title">${title || 'Untitled'}</h3>
        <p class="post-card-excerpt">${excerpt || ''}</p>
      </div>
      <div class="post-card-footer">
        <span class="read-more">Read More →</span>
        <span class="read-time">${readTime || '5'} min read</span>
      </div>
    </article>
  `;
}

// --- Load Featured Posts ---
async function loadFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  try {
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      where('featured', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(3)
    );
    const snap = await getDocs(q);
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (posts.length === 0) {
      // Fallback: load any published posts
      const fallback = query(
        collection(db, 'posts'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        limit(3)
      );
      const fSnap = await getDocs(fallback);
      posts.push(...fSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }

    if (posts.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-secondary);padding:20px;">No featured posts yet.</p>';
      return;
    }

    grid.innerHTML = posts.map((p, i) => buildPostCard(p, i === 0)).join('');
    initReveal();
  } catch (err) {
    console.error('Error loading featured posts:', err);
    grid.innerHTML = '<p style="color:var(--text-secondary);padding:20px;">Could not load posts.</p>';
  }
}

// --- Load Latest Posts ---
async function loadLatest() {
  const grid = document.getElementById('latestGrid');
  if (!grid) return;

  try {
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(4)
    );
    const snap = await getDocs(q);
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (posts.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-secondary);padding:20px;">No posts yet. Check back soon!</p>';
      return;
    }

    grid.innerHTML = posts.map((p) => buildPostCard(p)).join('');
    initReveal();
  } catch (err) {
    console.error('Error loading latest posts:', err);
    grid.innerHTML = '<p style="color:var(--text-secondary);padding:20px;">Could not load posts.</p>';
  }
}

// --- GSAP Animations (if available) ---
function initGSAP() {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Section headers
  gsap.utils.toArray('.section-header').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
      y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
    });
  });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  loadFeatured();
  loadLatest();
  initReveal();
  initGSAP();
});
