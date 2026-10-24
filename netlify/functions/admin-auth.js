/**
 * SHAIVIKA IT TECHNOLOGIES - SECURE SERVER-SIDE ADMIN AUTHENTICATION
 * Netlify Serverless Function
 * 
 * Enforces:
 * - Server-side credential verification with salted cryptographic hashing (PBKDF2)
 * - Anti-brute-force rate limiting and IP lockout (5 failed attempts -> 15 min lock)
 * - Cryptographically signed HMAC-SHA256 session tokens with 8-hour expiry
 * - Zero hardcoded credentials in client bundles
 * - Secure audit logging with no secret leakage
 */

const crypto = require('crypto');

// Configuration from Environment Variables
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'shaivika-auth-prod-sec-key-7981431094-v1';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'shaivika';

// Default secure hashed bootstrap credentials (Used only when ADMIN_PASSWORD_HASH is unset)
// Generated using PBKDF2: 100,000 iterations, 32 bytes, sha256
const DEFAULT_SALT = 'e6c27940177b94ad3fc865bc441da025';
// Salted PBKDF2 hash of administrator master password
const DEFAULT_HASH = '2a14df30ac1c53c3ff121bf7feac4c42b20272065e659dc7c256d0831bfdc721';

const ADMIN_SALT = process.env.ADMIN_PASSWORD_SALT || DEFAULT_SALT;
const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;

// In-memory rate limiting and lockout table (persists across warm lambda invocations)
const failedAttempts = new Map();
const revokedTokens = new Set();
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Audit Logger
function auditLog(actor, action, resourceId, status, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    actor: actor || 'anonymous',
    action: action,
    resource_id: resourceId || 'auth_subsystem',
    status: status
  };
  // Structured stdout for cloud log collection (e.g. Netlify/CloudWatch)
  console.log(JSON.stringify(logEntry));
}

// Cryptographic Password Verification using PBKDF2
function verifyPassword(password, salt, expectedHash) {
  if (!password || !salt || !expectedHash) return false;
  const derived = crypto.pbkdf2Sync(String(password), salt, 100000, 32, 'sha256').toString('hex');
  const bufferA = Buffer.from(derived, 'hex');
  const bufferB = Buffer.from(expectedHash, 'hex');
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

// Generate Hash for Password Updates
function hashPassword(password, customSalt) {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(String(password), salt, 100000, 32, 'sha256').toString('hex');
  return { salt, hash };
}

// Sign HMAC-SHA256 Token
function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

// Verify HMAC-SHA256 Token
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  if (revokedTokens.has(token)) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');

  const sigA = Buffer.from(signature);
  const sigB = Buffer.from(expectedSignature);
  if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// Client IP extractor
function getClientIp(event) {
  const headers = (event && event.headers) || {};
  return (
    headers['x-forwarded-for']?.split(',')[0].trim() ||
    headers['client-ip'] ||
    headers['x-real-ip'] ||
    '127.0.0.1'
  );
}

// Check Lockout
function checkLockout(ip) {
  const record = failedAttempts.get(ip);
  if (!record) return { locked: false, remainingSec: 0 };
  const now = Date.now();
  if (record.lockoutUntil && record.lockoutUntil > now) {
    return { locked: true, remainingSec: Math.ceil((record.lockoutUntil - now) / 1000) };
  }
  if (record.lockoutUntil && record.lockoutUntil <= now) {
    failedAttempts.delete(ip);
  }
  return { locked: false, remainingSec: 0 };
}

// Record Failure
function recordFailure(ip) {
  const now = Date.now();
  const record = failedAttempts.get(ip) || { count: 0, firstAttempt: now, lockoutUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_WINDOW_MS;
  }
  failedAttempts.set(ip, record);
  return record;
}

// Clear Failures on Success
function clearFailures(ip) {
  failedAttempts.delete(ip);
}

// CORS Headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  const clientIp = getClientIp(event);

  try {
    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (err) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'error', message: 'Malformed JSON payload' })
        };
      }
    }

    const action = body.action || (event.queryStringParameters && event.queryStringParameters.action) || 'verify';

    // 1. ACTION: LOGIN
    if (action === 'login') {
      const lockout = checkLockout(clientIp);
      if (lockout.locked) {
        auditLog(body.username, 'admin_login_locked', clientIp, 'rejected');
        return {
          statusCode: 429,
          headers: corsHeaders,
          body: JSON.stringify({
            status: 'error',
            code: 'ACCOUNT_LOCKED',
            message: `Account locked due to consecutive failed attempts. Please retry in ${lockout.remainingSec} seconds.`
          })
        };
      }

      const username = String(body.username || '').trim();
      const password = String(body.password || '').trim();

      if (!username || !password) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'error', message: 'Username and password are required' })
        };
      }

      // Check username against configured admin user
      const isUserMatch = (username === ADMIN_USER || username === 'admin' || username === 'shaivika');
      const isPassMatch = isUserMatch && verifyPassword(password, ADMIN_SALT, ADMIN_HASH);

      if (!isPassMatch) {
        const failureRecord = recordFailure(clientIp);
        const remaining = Math.max(0, MAX_ATTEMPTS - failureRecord.count);
        auditLog(username, 'admin_login_attempt', clientIp, 'failed');

        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({
            status: 'error',
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid credentials.',
            attemptsRemaining: failureRecord.lockoutUntil > 0 ? 0 : remaining,
            locked: failureRecord.lockoutUntil > 0
          })
        };
      }

      // Login Successful
      clearFailures(clientIp);

      const exp = Math.floor(Date.now() / 1000) + (8 * 3600); // 8 hours
      const payload = {
        sub: username,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: exp,
        jti: crypto.randomBytes(16).toString('hex')
      };

      const token = signToken(payload);
      auditLog(username, 'admin_login_success', clientIp, 'success');

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          status: 'success',
          token: token,
          user: {
            username: username,
            role: 'admin'
          },
          expiresAt: exp * 1000
        })
      };
    }

    // 2. ACTION: VERIFY SESSION TOKEN
    if (action === 'verify') {
      const authHeader = event.headers.authorization || event.headers.Authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : (body.token || '');

      const payload = verifyToken(token);
      if (!payload) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'error', code: 'UNAUTHORIZED', message: 'Invalid or expired session token' })
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          status: 'success',
          valid: true,
          user: {
            username: payload.sub,
            role: payload.role
          },
          expiresAt: payload.exp * 1000
        })
      };
    }

    // 3. ACTION: LOGOUT
    if (action === 'logout') {
      const authHeader = event.headers.authorization || event.headers.Authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : (body.token || '');
      if (token) revokedTokens.add(token);

      auditLog('admin', 'admin_logout', clientIp, 'success');
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ status: 'success', message: 'Session logged out successfully' })
      };
    }

    // 4. ACTION: CHANGE PASSWORD (Authenticated)
    if (action === 'changePassword') {
      const authHeader = event.headers.authorization || event.headers.Authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : (body.token || '');
      const payload = verifyToken(token);
      if (!payload) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'error', code: 'UNAUTHORIZED', message: 'Authentication required' })
        };
      }

      const currentPass = String(body.currentPassword || '').trim();
      const newPass = String(body.newPassword || '').trim();

      if (!currentPass || !newPass) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'error', message: 'Current and new password required' })
        };
      }

      if (newPass.length < 10) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'error', message: 'New password must be at least 10 characters long' })
        };
      }

      if (!verifyPassword(currentPass, ADMIN_SALT, ADMIN_HASH)) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'error', message: 'Current password is incorrect' })
        };
      }

      const generated = hashPassword(newPass);
      auditLog(payload.sub, 'admin_password_changed', clientIp, 'success');

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          status: 'success',
          message: 'Password hashed successfully. Set these environment variables in Netlify to lock the new password:',
          newSalt: generated.salt,
          newHash: generated.hash
        })
      };
    }

    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ status: 'error', message: `Unknown action: ${action}` })
    };

  } catch (error) {
    auditLog('system', 'admin_auth_exception', clientIp, 'error');
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ status: 'error', message: 'Internal authentication server error' })
    };
  }
};

// Export verification helper for api.js
exports.verifyToken = verifyToken;
exports.auditLog = auditLog;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
