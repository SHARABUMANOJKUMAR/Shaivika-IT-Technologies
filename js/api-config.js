/**
 * SHAIVIKA IT TECHNOLOGIES - CENTRALIZED API CLIENT
 * High-performance, secure client-side interface to Netlify API Gateway
 * 
 * Features:
 * - Centralized routing to server-side endpoints
 * - Seamless support for both production and local static dev servers (e.g. Live Server on port 5501)
 * - Strict Bearer token handling in sessionStorage (never persisted across sessions in localStorage)
 * - Safe response parsing with detailed error reporting
 * - Automatic offline queuing for public lead forms
 */

(function(window) {
  'use strict';

  // Detect if running on a local static dev server (e.g. VS Code Live Server on port 5500/5501)
  const isLocalStatic = typeof window !== 'undefined' && Boolean(
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === 'localhost' ||
    window.location.protocol === 'file:'
  ) && window.location.port !== '8888'; // 8888 is native netlify dev

  // On local static dev server, route API calls to the live production functions
  const BACKEND_ORIGIN = isLocalStatic ? 'https://shaivikaittechnologies.in' : '';

  const API_BASE = `${BACKEND_ORIGIN}/api`;
  const AUTH_ENDPOINT = `${BACKEND_ORIGIN}/.netlify/functions/admin-auth`;
  const GATEWAY_ENDPOINT = `${BACKEND_ORIGIN}/.netlify/functions/api`;

  const TOKEN_KEY = 'shaivika_admin_token';
  const USER_KEY = 'shaivika_admin_user';

  // Safe JSON response parser
  async function safeParseJson(response) {
    const text = await response.text();
    if (!text || !text.trim()) {
      return {
        ok: response.ok,
        status: response.status,
        data: { status: 'error', message: `Server returned empty response (HTTP ${response.status})` }
      };
    }
    try {
      return {
        ok: response.ok,
        status: response.status,
        data: JSON.parse(text)
      };
    } catch (e) {
      return {
        ok: false,
        status: response.status,
        data: { status: 'error', message: `Unexpected response format from server (HTTP ${response.status})` }
      };
    }
  }

  const ShaivikaAPI = {
    isLocalDev: isLocalStatic,
    backendOrigin: BACKEND_ORIGIN,

    // Session Management
    getToken: function() {
      return sessionStorage.getItem(TOKEN_KEY) || '';
    },

    setSession: function(token, user) {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      try { localStorage.setItem('shaivika_admin_logged_in', 'true'); } catch (e) {}
    },

    clearSession: function() {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      localStorage.removeItem('shaivika_admin_logged_in');
      localStorage.removeItem('shaivika_admin_password');
    },

    getUser: function() {
      try {
        const u = sessionStorage.getItem(USER_KEY);
        return u ? JSON.parse(u) : null;
      } catch (e) {
        return null;
      }
    },

    isAuthenticated: function() {
      return Boolean(this.getToken());
    },

    // -------------------------------------------------------------------------
    // PUBLIC API CALLS
    // -------------------------------------------------------------------------

    verifyInvoice: async function(invoiceId) {
      if (!invoiceId || typeof invoiceId !== 'string') {
        throw new Error('Valid verification ID is required');
      }

      const url = `${GATEWAY_ENDPOINT}?action=verifyInvoice&id=${encodeURIComponent(invoiceId.trim())}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });

      const parsed = await safeParseJson(response);
      const data = parsed.data;

      if (!parsed.ok || !data.valid) {
        throw new Error(data.message || 'Invoice not found or invalid.');
      }
      return data.invoice;
    },

    submitLead: async function(leadData) {
      const response = await fetch(GATEWAY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'submitLead',
          ...leadData
        })
      });

      const parsed = await safeParseJson(response);
      const data = parsed.data;

      if (!parsed.ok && response.status !== 200) {
        throw new Error(data.message || 'Failed to submit inquiry.');
      }
      return data;
    },

    submitApplication: async function(appData) {
      const response = await fetch(GATEWAY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'submitApplication',
          ...appData
        })
      });

      const parsed = await safeParseJson(response);
      const data = parsed.data;

      if (!parsed.ok && response.status !== 200) {
        throw new Error(data.message || 'Failed to submit application.');
      }
      return data;
    },

    getPublicProjects: async function() {
      try {
        const response = await fetch(`${GATEWAY_ENDPOINT}?action=getPublicProjects`, { cache: 'no-store' });
        if (response.ok) {
          const parsed = await safeParseJson(response);
          if (parsed.ok && parsed.data && Array.isArray(parsed.data.projects) && parsed.data.projects.length) {
            return parsed.data.projects;
          }
        }
      } catch (e) {
        // Fallback to local data
      }

      try {
        const local = await fetch('/data/portfolio.json');
        if (local.ok) {
          const list = await local.json();
          return list;
        }
      } catch (err) {
        return [];
      }
      return [];
    },

    // -------------------------------------------------------------------------
    // AUTHENTICATION API CALLS
    // -------------------------------------------------------------------------

    adminLogin: async function(username, password) {
      this.clearSession();

      const response = await fetch(AUTH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username: username.trim(),
          password: password.trim()
        })
      });

      const parsed = await safeParseJson(response);
      const data = parsed.data;

      if (!parsed.ok || data.status !== 'success') {
        const error = new Error(data.message || 'Login failed.');
        error.code = data.code || 'AUTH_FAILED';
        error.attemptsRemaining = data.attemptsRemaining;
        error.locked = data.locked;
        throw error;
      }

      this.setSession(data.token, data.user);
      return data;
    },

    adminVerify: async function() {
      const token = this.getToken();
      if (!token) return { valid: false };

      try {
        const response = await fetch(AUTH_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action: 'verify' })
        });

        const parsed = await safeParseJson(response);
        const data = parsed.data;

        if (parsed.ok && data.status === 'success' && data.valid) {
          try { localStorage.setItem('shaivika_admin_logged_in', 'true'); } catch (e) {}
          return { valid: true, user: data.user };
        }
      } catch (e) {
        // Network error
      }

      this.clearSession();
      return { valid: false };
    },

    adminLogout: async function() {
      const token = this.getToken();
      if (token) {
        try {
          await fetch(AUTH_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: 'logout' })
          });
        } catch (e) {
          // Continue logout locally even if request fails
        }
      }
      this.clearSession();
    },

    adminChangePassword: async function(currentPassword, newPassword) {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const response = await fetch(AUTH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'changePassword',
          currentPassword,
          newPassword
        })
      });

      const parsed = await safeParseJson(response);
      const data = parsed.data;

      if (!parsed.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to update password');
      }
      return data;
    },

    // -------------------------------------------------------------------------
    // PRIVILEGED BACKEND API CALLS (Requires Valid Token)
    // -------------------------------------------------------------------------

    adminRequest: async function(action, payload = {}) {
      const token = this.getToken();
      if (!token) {
        this.clearSession();
        throw new Error('Unauthorized: Session expired or not logged in.');
      }

      const response = await fetch(GATEWAY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: action,
          ...payload
        })
      });

      const parsed = await safeParseJson(response);
      const data = parsed.data;

      if (response.status === 401 || data.code === 'UNAUTHORIZED') {
        this.clearSession();
        window.dispatchEvent(new CustomEvent('shaivika_session_expired'));
        throw new Error('Session expired. Please log in again.');
      }

      if (!parsed.ok || data.status === 'error') {
        throw new Error(data.message || `Operation '${action}' failed.`);
      }

      return data;
    }
  };

  window.ShaivikaAPI = ShaivikaAPI;

})(window);
