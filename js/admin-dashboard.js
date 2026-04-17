// js/admin-dashboard.js
import { auth, db } from './firebase-config.js';
import {
  onAuthStateChanged, signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  collection, getDocs, query, where, orderBy, limit,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Auth guard
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = 'login.html';
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  await signOut(auth);
  window.location.href = 'login.html';
});

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts.seconds * 1000).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

async function loadStats() {
  try {
    const postsSnap = await getDocs(collection(db, 'posts'));
    const posts = postsSnap.docs.map(d => d.data());
    const published = posts.filter(p => p.status === 'published').length;
    const drafts = posts.filter(p => p.status === 'draft').length;

    document.getElementById('statTotal').textContent = posts.length;
    document.getElementById('statPublished').textContent = published;
    document.getElementById('statDrafts').textContent = drafts;

    const msgSnap = await getDocs(collection(db, 'messages'));
    document.getElementById('statMessages').textContent = msgSnap.size;
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

async function loadRecentPosts() {
  const tbody = document.getElementById('recentPostsBody');
  try {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(8));
    const snap = await getDocs(q);
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (posts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="color:var(--text-secondary);text-align:center;padding:40px;">No posts yet. <a href="editor.html" style="color:var(--accent);">Create your first post →</a></td></tr>';
      return;
    }

    tbody.innerHTML = posts.map(p => `
      <tr>
        <td style="font-weight:500;max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.title || 'Untitled'}</td>
        <td><span class="post-tag">${p.category || 'General'}</span></td>
        <td><span class="status-badge ${p.status === 'published' ? 'published' : 'draft'}">${p.status || 'draft'}</span></td>
        <td style="color:var(--text-secondary);font-size:0.8rem;">${formatDate(p.createdAt)}</td>
        <td>
          <div class="table-actions">
            <button class="action-btn edit" onclick="window.location='editor.html?id=${p.id}'">Edit</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading posts:', err);
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--error);text-align:center;padding:20px;">Failed to load posts.</td></tr>';
  }
}

loadStats();
loadRecentPosts();
