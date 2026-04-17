// js/post.js
import { db } from './firebase-config.js';
import {
  doc, getDoc, collection, query, where, orderBy, limit, getDocs,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle) navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));

const isMobile = window.innerWidth < 768;

function getPostId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts.seconds * 1000).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function initGSAPScrollEffect() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const featuredImg = document.querySelector('.featured-image, .featured-image-placeholder');
  const articleContent = document.getElementById('articleContent');

  if (!featuredImg || !articleContent) return;

  gsap.to(featuredImg, {
    scrollTrigger: {
      trigger: articleContent,
      start: 'top bottom',
      end: 'top top',
      scrub: true,
    },
    scale: isMobile ? 1.1 : 1.3,
    opacity: 0,
    ease: 'none',
  });
}

function buildRelatedCard(post) {
  const { id, title, excerpt, category, imageUrl, publishedAt, readTime } = post;
  const date = publishedAt
    ? new Date(publishedAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const imgHtml = imageUrl
    ? `<div class="post-card-img"><img src="${imageUrl}" alt="${title}" loading="lazy" /></div>`
    : `<div class="post-card-img-placeholder">${(title || 'E')[0]}</div>`;

  return `
    <article class="post-card" onclick="window.location='post.html?id=${id}'">
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

async function loadRelated(category, currentId) {
  try {
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      where('category', '==', category),
      orderBy('publishedAt', 'desc'),
      limit(4)
    );
    const snap = await getDocs(q);
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== currentId);

    if (posts.length > 0) {
      document.getElementById('relatedSection').style.display = 'block';
      document.getElementById('relatedGrid').innerHTML = posts.slice(0, 3).map(buildRelatedCard).join('');
    }
  } catch (err) {
    console.warn('Could not load related posts:', err);
  }
}

async function loadPost() {
  const id = getPostId();
  const articleContent = document.getElementById('articleContent');
  const loadingState = document.getElementById('loadingState');

  if (!id) {
    loadingState.textContent = 'Post not found.';
    return;
  }

  try {
    const docRef = doc(db, 'posts', id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      loadingState.textContent = 'Post not found.';
      return;
    }

    const post = { id: snap.id, ...snap.data() };
    document.title = `${post.title || 'Post'} — Emmanuel`;

    // Hero image
    const imgWrap = document.getElementById('featuredImgWrap');
    if (post.imageUrl) {
      imgWrap.innerHTML = `<img class="featured-image" src="${post.imageUrl}" alt="${post.title}" />`;
    } else {
      imgWrap.innerHTML = `<div class="featured-image-placeholder">${(post.title || 'E')[0]}</div>`;
    }

    // Hero content
    document.getElementById('postHeroContent').innerHTML = `
      <div class="post-card-meta" style="margin-bottom:16px;">
        <span class="post-tag">${post.category || 'General'}</span>
        <span class="post-date">${formatDate(post.publishedAt)}</span>
        <span class="post-date">${post.readTime || '5'} min read</span>
      </div>
      <h1 style="font-family:var(--font-heading);font-size:clamp(2rem,5vw,3.5rem);font-weight:900;letter-spacing:-1.5px;line-height:1.1;max-width:800px;">
        ${post.title || 'Untitled'}
      </h1>
      ${post.authorName ? `<p style="margin-top:16px;color:var(--text-secondary);font-size:0.875rem;">By ${post.authorName}</p>` : ''}
    `;

    // Article body
    loadingState.remove();
    const bodyDiv = document.createElement('div');
    bodyDiv.innerHTML = post.content || '<p>No content yet.</p>';
    articleContent.appendChild(bodyDiv);

    // GSAP effect
    setTimeout(initGSAPScrollEffect, 100);

    // Load related
    if (post.category) loadRelated(post.category, id);

  } catch (err) {
    console.error('Error loading post:', err);
    loadingState.textContent = 'Failed to load post. Please try again.';
  }
}

loadPost();
