// js/admin-editor.js
import { auth, db } from './firebase-config.js';
import {
  onAuthStateChanged, signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  collection, doc, getDoc, addDoc, updateDoc, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = 'login.html';
  else loadExistingPost();
});

document.getElementById('logoutBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  await signOut(auth);
  window.location.href = 'login.html';
});

// Get post ID from URL (if editing)
function getPostId() {
  return new URLSearchParams(window.location.search).get('id');
}

// Load post data into editor if editing
async function loadExistingPost() {
  const id = getPostId();
  if (!id) return; // New post

  document.getElementById('editorHeading').textContent = 'Edit Post';

  try {
    const snap = await getDoc(doc(db, 'posts', id));
    if (!snap.exists()) { alert('Post not found.'); return; }

    const p = snap.data();
    document.getElementById('postTitle').value = p.title || '';
    document.getElementById('postCategory').value = p.category || '';
    document.getElementById('postExcerpt').value = p.excerpt || '';
    document.getElementById('postImageUrl').value = p.imageUrl || '';
    document.getElementById('postReadTime').value = p.readTime || 5;
    document.getElementById('postTags').value = (p.tags || []).join(', ');
    document.getElementById('editor-area').innerHTML = p.content || '';
    document.getElementById('featuredToggle').checked = p.featured || false;
  } catch (err) {
    console.error('Error loading post:', err);
    alert('Failed to load post.');
  }
}

function getFormData() {
  return {
    title: document.getElementById('postTitle').value.trim(),
    category: document.getElementById('postCategory').value.trim(),
    excerpt: document.getElementById('postExcerpt').value.trim(),
    imageUrl: document.getElementById('postImageUrl').value.trim(),
    readTime: parseInt(document.getElementById('postReadTime').value) || 5,
    tags: document.getElementById('postTags').value.split(',').map(t => t.trim()).filter(Boolean),
    content: document.getElementById('editor-area').innerHTML,
    featured: document.getElementById('featuredToggle').checked,
  };
}

function showMessage(text, type) {
  const el = document.getElementById('editorMessage');
  el.textContent = text;
  el.className = `form-message ${type}`;
  setTimeout(() => { el.className = 'form-message'; }, 5000);
}

function setStatus(text) {
  document.getElementById('saveStatus').textContent = text;
  setTimeout(() => { document.getElementById('saveStatus').textContent = ''; }, 3000);
}

async function savePost(status) {
  const data = getFormData();
  if (!data.title) { showMessage('Please enter a post title.', 'error'); return; }

  const id = getPostId();
  const payload = {
    ...data,
    status,
    updatedAt: serverTimestamp(),
  };

  if (status === 'published' && !id) {
    payload.publishedAt = serverTimestamp();
  }

  try {
    if (id) {
      await updateDoc(doc(db, 'posts', id), payload);
      setStatus('✓ Saved');
      showMessage('Post updated successfully.', 'success');
    } else {
      payload.createdAt = serverTimestamp();
      const ref = await addDoc(collection(db, 'posts'), payload);
      // Redirect to edit mode with new ID
      window.history.replaceState({}, '', `editor.html?id=${ref.id}`);
      document.getElementById('editorHeading').textContent = 'Edit Post';
      setStatus('✓ Saved');
      showMessage(status === 'published' ? 'Post published!' : 'Draft saved.', 'success');
    }
  } catch (err) {
    console.error('Save error:', err);
    showMessage('Failed to save. Please try again.', 'error');
  }
}

// Wire up all save/publish buttons
document.getElementById('saveDraftBtn').addEventListener('click', () => savePost('draft'));
document.getElementById('saveDraftBtn2').addEventListener('click', () => savePost('draft'));
document.getElementById('publishBtn').addEventListener('click', () => savePost('published'));
document.getElementById('publishBtn2').addEventListener('click', () => savePost('published'));

// Auto-save draft every 60 seconds
setInterval(() => {
  const title = document.getElementById('postTitle').value.trim();
  if (title) {
    savePost('draft');
    setStatus('Auto-saved');
  }
}, 60000);
