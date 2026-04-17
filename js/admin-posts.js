// js/admin-posts.js
import { auth, db } from './firebase-config.js';
import {
  onAuthStateChanged, signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  collection, getDocs, doc, deleteDoc, updateDoc,
  orderBy, query,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = 'login.html';
});

document.getElementById('logoutBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  await signOut(auth);
  window.location.href = 'login.html';
});

let allPosts = [];

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts.seconds * 1000).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function renderTable(posts) {
  const tbody = document.getElementById('postsTableBody');
  if (posts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="color:var(--text-secondary);text-align:center;padding:40px;">No posts found.</td></tr>';
    return;
  }

  tbody.innerHTML = posts.map(p => `
    <tr id="row-${p.id}">
      <td style="font-weight:500;max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.title || 'Untitled'}</td>
      <td><span class="post-tag">${p.category || 'General'}</span></td>
      <td><span class="status-badge ${p.status === 'published' ? 'published' : 'draft'}" id="status-${p.id}">${p.status || 'draft'}</span></td>
      <td style="color:var(--text-secondary);font-size:0.8rem;">${p.featured ? '⭐ Yes' : '—'}</td>
      <td style="color:var(--text-secondary);font-size:0.8rem;">${formatDate(p.createdAt)}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn edit" onclick="window.location='editor.html?id=${p.id}'">Edit</button>
          <button class="action-btn edit" onclick="toggleStatus('${p.id}', '${p.status}')">${p.status === 'published' ? 'Unpublish' : 'Publish'}</button>
          <button class="action-btn delete" onclick="deletePost('${p.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function loadPosts() {
  const tbody = document.getElementById('postsTableBody');
  try {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    allPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTable(allPosts);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="6" style="color:var(--error);text-align:center;padding:20px;">Failed to load posts.</td></tr>';
  }
}

window.deletePost = async (id) => {
  if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
  try {
    await deleteDoc(doc(db, 'posts', id));
    allPosts = allPosts.filter(p => p.id !== id);
    document.getElementById(`row-${id}`)?.remove();
  } catch (err) {
    alert('Failed to delete post.');
    console.error(err);
  }
};

window.toggleStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  try {
    const updates = { status: newStatus };
    if (newStatus === 'published') {
      const { serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      updates.publishedAt = serverTimestamp();
    }
    await updateDoc(doc(db, 'posts', id), updates);
    // Update local data + re-render
    allPosts = allPosts.map(p => p.id === id ? { ...p, status: newStatus } : p);
    renderTable(allPosts);
  } catch (err) {
    alert('Failed to update post status.');
    console.error(err);
  }
};

// Search
document.getElementById('postsSearch').addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase().trim();
  if (!term) { renderTable(allPosts); return; }
  const filtered = allPosts.filter(p =>
    (p.title || '').toLowerCase().includes(term) ||
    (p.category || '').toLowerCase().includes(term)
  );
  renderTable(filtered);
});

loadPosts();
