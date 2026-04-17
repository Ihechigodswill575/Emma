// js/admin-auth.js
import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// If already logged in, redirect to dashboard
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = 'dashboard.html';
});

const loginBtn = document.getElementById('loginBtn');
const loginMessage = document.getElementById('loginMessage');

loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  loginMessage.className = 'form-message';
  loginMessage.style.display = 'none';

  if (!email || !password) {
    loginMessage.textContent = 'Please enter your email and password.';
    loginMessage.classList.add('error');
    return;
  }

  loginBtn.textContent = 'Signing in...';
  loginBtn.disabled = true;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = 'dashboard.html';
  } catch (err) {
    let msg = 'Login failed. Please check your credentials.';
    if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
    if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
    if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Please try again later.';

    loginMessage.textContent = msg;
    loginMessage.classList.add('error');
  } finally {
    loginBtn.textContent = 'Sign In';
    loginBtn.disabled = false;
  }
});

// Enter key support
document.getElementById('loginPassword').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});

// Forgot password
document.getElementById('forgotPasswordLink').addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  loginMessage.className = 'form-message';
  loginMessage.style.display = 'none';

  if (!email) {
    loginMessage.textContent = 'Enter your email above, then click "Forgot password?"';
    loginMessage.classList.add('error');
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    loginMessage.textContent = `Password reset email sent to ${email}`;
    loginMessage.classList.add('success');
  } catch (err) {
    loginMessage.textContent = 'Could not send reset email. Check the address and try again.';
    loginMessage.classList.add('error');
  }
});
