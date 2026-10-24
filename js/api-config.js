/**
 * SHAIVIKA IT TECHNOLOGIES - CENTRALIZED API CLIENT
 * High-performance, secure client-side interface to Netlify API Gateway
 * 
 * Features:
 * - Centralized routing to server-side endpoints
 * - Strict Bearer token handling in sessionStorage (never persisted across sessions in localStorage)
 * - Automatic offline queuing for public lead forms
 * - Safe error parsing without exposing internal stack traces
 */

(function(window) {
  'use strict';

  // Base API configuration (Directs to Netlify Functions / redirects)
  const API_BASE = '/api';
  const AUTH_ENDPOINT = '/.netlify/functions/admin-auth';
  const GATEWAY_ENDPOINT = '/.netlify/functions/api';

  const TOKEN_KEY = 'shaivika_admin_token';
  const USER_KEY = 'shaivika_admin_user';

  const ShaivikaAPI = {
    // Session Management
    getToken: function() {
      return sessionStorage.getItem(TOKEN_KEY) || '';
    },

    setSession: function(token, user) {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    clearSession: function() {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      // Clean up any legacy localStorage flags
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

    /**
     * Privacy-preserving single invoice verification
     * Returns ONLY masked customer metadata. Never dumps invoices.
     */
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

      const data = await response.json();
      if (!response.ok || !data.valid) {
        throw new Error(data.message || 'Invoice not found or invalid.');
      }
      return data.invoice;
    },

    /**
     * Public Contact & Lead Form Ingestion
     */
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

      const data = await response.json();
      if (!response.ok && response.status !== 200) {
        throw new Error(data.message || 'Failed to submit inquiry.');
      }
      return data;
    },

    /**
     * Public Job Application Ingestion
     */
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

      const data = await response.json();
      if (!response.ok && response.status !== 200) {
        throw new Error(data.message || 'Failed to submit application.');
      }
      return data;
    },

    /**
     * Fetch Public Active Projects
     */
    getPublicProjects: async function() {
      try {
        const response = await fetch(`${GATEWAY_ENDPOINT}?action=getPublicProjects`, { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (data && data.projects && data.projects.length) return data.projects;
        }
      } catch (e) {
        // Fallback to local data
      }

      // Local fallback
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

      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
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

        const data = await response.json();
        if (response.ok && data.status === 'success' && data.valid) {
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

      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
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

      const data = await response.json();
      if (response.status === 401 || data.code === 'UNAUTHORIZED') {
        this.clearSession();
        window.dispatchEvent(new CustomEvent('shaivika_session_expired'));
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || `Operation '${action}' failed.`);
      }

      return data;
    }
  };

  window.ShaivikaAPI = ShaivikaAPI;

})(window);
