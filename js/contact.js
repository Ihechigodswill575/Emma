// js/contact.js
import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('navToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

const submitBtn = document.getElementById('contactSubmit');
const formMessage = document.getElementById('formMessage');

submitBtn.addEventListener('click', async () => {
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const subject = document.getElementById('contactSubject').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  formMessage.className = 'form-message';
  formMessage.style.display = 'none';

  if (!name || !email || !message) {
    formMessage.textContent = 'Please fill in your name, email, and message.';
    formMessage.classList.add('error');
    return;
  }

  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  try {
    await addDoc(collection(db, 'messages'), {
      name, email, subject, message,
      createdAt: serverTimestamp(),
      read: false,
    });

    formMessage.textContent = "Message sent! I'll get back to you soon.";
    formMessage.classList.add('success');

    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactSubject').value = '';
    document.getElementById('contactMessage').value = '';
  } catch (err) {
    console.error('Error sending message:', err);
    formMessage.textContent = 'Something went wrong. Please try again.';
    formMessage.classList.add('error');
  } finally {
    submitBtn.textContent = 'Send Message';
    submitBtn.disabled = false;
  }
});
