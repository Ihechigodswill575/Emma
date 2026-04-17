// js/admin-messages.js
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
  else loadMessages();
});

document.getElementById('logoutBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  await signOut(auth);
  window.location.href = 'login.html';
});

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts.seconds * 1000).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

let messages = [];

async function loadMessages() {
  const tbody = document.getElementById('messagesBody');
  try {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (messages.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="color:var(--text-secondary);text-align:center;padding:40px;">No messages yet.</td></tr>';
      return;
    }

    renderMessages(messages);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--error);text-align:center;padding:20px;">Failed to load messages.</td></tr>';
  }
}

function renderMessages(msgs) {
  const tbody = document.getElementById('messagesBody');
  tbody.innerHTML = msgs.map(m => `
    <tr id="msg-${m.id}" style="${m.read ? '' : 'background:rgba(0,188,212,0.03);'}">
      <td style="font-weight:${m.read ? '400' : '600'};">${m.name || '—'}</td>
      <td style="color:var(--text-secondary);font-size:0.85rem;">${m.email || '—'}</td>
      <td style="color:var(--text-secondary);font-size:0.875rem;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.subject || '(no subject)'}</td>
      <td style="color:var(--text-secondary);font-size:0.8rem;">${formatDate(m.createdAt)}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn edit" onclick="viewMessage('${m.id}')">View</button>
          <button class="action-btn delete" onclick="deleteMessage('${m.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.viewMessage = async (id) => {
  const msg = messages.find(m => m.id === id);
  if (!msg) return;

  document.getElementById('msgModalContent').innerHTML = `
    <div style="margin-bottom:24px;">
      <p style="font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-secondary);margin-bottom:4px;">From</p>
      <p style="font-weight:600;">${msg.name}</p>
      <p style="color:var(--accent);font-size:0.875rem;">${msg.email}</p>
    </div>
    ${msg.subject ? `<div style="margin-bottom:24px;">
      <p style="font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-secondary);margin-bottom:4px;">Subject</p>
      <p>${msg.subject}</p>
    </div>` : ''}
    <div style="margin-bottom:24px;">
      <p style="font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-secondary);margin-bottom:8px;">Message</p>
      <p style="line-height:1.8;color:rgba(255,255,255,0.85);">${msg.message}</p>
    </div>
    <div style="margin-bottom:24px;">
      <p style="font-size:0.75rem;color:var(--text-secondary);">Received: ${formatDate(msg.createdAt)}</p>
    </div>
    <a href="mailto:${msg.email}?subject=Re: ${msg.subject || 'Your message'}" class="btn-primary" style="opacity:1;animation:none;">Reply via Email</a>
  `;
  document.getElementById('msgModal').style.display = 'flex';

  // Mark as read
  if (!msg.read) {
    try {
      await updateDoc(doc(db, 'messages', id), { read: true });
      messages = messages.map(m => m.id === id ? { ...m, read: true } : m);
      const row = document.getElementById(`msg-${id}`);
      if (row) { row.style.background = ''; row.querySelector('td').style.fontWeight = '400'; }
    } catch (err) {
      console.warn('Could not mark as read:', err);
    }
  }
};

window.deleteMessage = async (id) => {
  if (!confirm('Delete this message?')) return;
  try {
    await deleteDoc(doc(db, 'messages', id));
    messages = messages.filter(m => m.id !== id);
    document.getElementById(`msg-${id}`)?.remove();
    if (messages.length === 0) {
      document.getElementById('messagesBody').innerHTML =
        '<tr><td colspan="5" style="color:var(--text-secondary);text-align:center;padding:40px;">No messages.</td></tr>';
    }
  } catch (err) {
    alert('Failed to delete message.');
  }
};
