/**
 * SHAIVIKA IT TECHNOLOGIES - ADMIN AUTH CONTROLLER
 * Manages client authentication flow, session verification, and secure portal mounting
 */

(function() {
  'use strict';

  function showToast(message, type = 'success') {
    const toastBox = document.getElementById('toastBox');
    const toastIcon = document.getElementById('toastIcon');
    const toastMsg = document.getElementById('toastMsg');
    if (!toastBox) return;

    if (toastIcon) toastIcon.textContent = type === 'error' ? '❌' : (type === 'warning' ? '⚠️' : '✅');
    if (toastMsg) toastMsg.textContent = message;

    toastBox.className = `toast show ${type}`;
    clearTimeout(toastBox._timer);
    toastBox._timer = setTimeout(() => {
      toastBox.classList.remove('show');
    }, 4500);
  }
  window.showToast = showToast;

  document.addEventListener('DOMContentLoaded', async () => {
    const loginWrapper = document.getElementById('loginWrapper');
    const loginForm = document.getElementById('loginForm');
    const mountPoint = document.getElementById('adminAppMount');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // 1. Initial Authentication Check via Server-side Verification
    async function verifyAndMount() {
      if (!window.ShaivikaAPI) return;

      const authResult = await window.ShaivikaAPI.adminVerify();
      if (authResult.valid) {
        if (loginWrapper) loginWrapper.style.display = 'none';
        if (mountPoint && typeof window.mountAdminPortal === 'function') {
          window.mountAdminPortal(mountPoint, authResult.user);
        }
      } else {
        if (loginWrapper) loginWrapper.style.display = 'flex';
        if (mountPoint) {
          if (typeof window.unmountAdminPortal === 'function') window.unmountAdminPortal();
          mountPoint.innerHTML = '';
        }
      }
    }

    // 2. Handle Login Submission
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const origText = submitBtn ? submitBtn.innerHTML : 'Sign In';

        const username = (usernameInput?.value || '').trim();
        const password = (passwordInput?.value || '').trim();

        if (!username || !password) {
          showToast('Please enter both username and password.', 'error');
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Authenticating...';
        }

        try {
          const res = await window.ShaivikaAPI.adminLogin(username, password);
          showToast('Login successful! Welcome to Shaivika Admin.', 'success');
          loginForm.reset();
          if (loginWrapper) loginWrapper.style.display = 'none';
          if (mountPoint && typeof window.mountAdminPortal === 'function') {
            window.mountAdminPortal(mountPoint, res.user);
          }
        } catch (err) {
          const msg = err.message || 'Authentication failed.';
          showToast(msg, 'error');
          if (err.locked && submitBtn) {
            submitBtn.disabled = true;
          }
        } finally {
          if (submitBtn && submitBtn.innerHTML === 'Authenticating...') {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
          }
        }
      });
    }

    // 3. Listen for session expiration
    window.addEventListener('shaivika_session_expired', () => {
      showToast('Session expired. Please sign in again.', 'warning');
      if (loginWrapper) loginWrapper.style.display = 'flex';
      if (mountPoint) {
        if (typeof window.unmountAdminPortal === 'function') window.unmountAdminPortal();
        mountPoint.innerHTML = '';
      }
    });

    // 4. Global Logout Handler
    window.handleAdminLogout = async () => {
      if (window.ShaivikaAPI) {
        await window.ShaivikaAPI.adminLogout();
      }
      showToast('Signed out successfully.', 'success');
      if (loginWrapper) loginWrapper.style.display = 'flex';
      if (mountPoint) {
        if (typeof window.unmountAdminPortal === 'function') window.unmountAdminPortal();
        mountPoint.innerHTML = '';
      }
    };

    // Run initial verification
    await verifyAndMount();
  });

})();
