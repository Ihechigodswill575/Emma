// js/blog.js
import { db } from './firebase-config.js';
import {
  collection, getDocs, query, where, orderBy,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle) navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));

function buildCard(post) {
  const { id, title, excerpt, category, imageUrl, publishedAt, readTime } = post;
  const date = publishedAt
    ? new Date(publishedAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
    </article>`;
}

let allPosts = [];
let activeCategory = 'all';
let searchTerm = '';

function render() {
  const grid = document.getElementById('blogGrid');
  const empty = document.getElementById('emptyState');

  let filtered = allPosts;
  if (activeCategory !== 'all') {
    filtered = filtered.filter(p => (p.category || 'General').toLowerCase() === activeCategory.toLowerCase());
  }
  if (searchTerm) {
    filtered = filtered.filter(p =>
      (p.title || '').toLowerCase().includes(searchTerm) ||
      (p.excerpt || '').toLowerCase().includes(searchTerm)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    grid.innerHTML = filtered.map(buildCard).join('');
    initReveal();
  }
}

function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.visible)');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

async function loadPosts() {
  try {
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );
    const snap = await getDocs(q);
    allPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Build category filter buttons
    const cats = [...new Set(allPosts.map(p => p.category || 'General'))];
    const filterBar = document.getElementById('filterBar');
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.cat = cat;
      btn.textContent = cat;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = cat;
        render();
      });
      filterBar.appendChild(btn);
    });

    render();
  } catch (err) {
    console.error('Error loading posts:', err);
    document.getElementById('blogGrid').innerHTML =
      '<p style="color:var(--text-secondary);padding:20px;grid-column:1/-1;">Could not load posts.</p>';
  }
}

// Category filter (All button)
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.cat;
    render();
  });
});

// Search
document.getElementById('searchInput').addEventListener('input', (e) => {
  searchTerm = e.target.value.toLowerCase().trim();
  render();
});

loadPosts();
