const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config');

function generateToken() { return crypto.randomBytes(32).toString('hex'); }
function generateOtp() { return generateToken(); }
function otpExpiry(minutes = 30) { return new Date(Date.now() + minutes * 60 * 1000); }

function signToken(userId, isAdmin = false, isSuperAdmin = false) {
  return jwt.sign({ userId: String(userId), isAdmin: !!isAdmin, isSuperAdmin: !!isSuperAdmin }, config.JWT_SECRET, { expiresIn: '1d' });
}
function verifyToken(token) { return jwt.verify(token, config.JWT_SECRET); }

function signResetToken(email) { return jwt.sign({ email, purpose: 'reset' }, config.JWT_SECRET, { expiresIn: '10m' }); }
function verifyResetToken(token) {
  const payload = jwt.verify(token, config.JWT_SECRET);
  if (payload.purpose !== 'reset') throw new Error('Invalid reset token');
  return payload;
}

async function hashPassword(password) { return bcrypt.hash(password, 12); }
async function comparePassword(password, hash) { return bcrypt.compare(password, hash); }

function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '').trim().slice(0, 500);
}

function validateEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return null;
}
function validatePassword(password) {
  if (!password || password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyToken(auth.slice(7));
    req.userId       = payload.userId;
    req.isAdmin      = payload.isAdmin;
    req.isSuperAdmin = payload.isSuperAdmin;
    const msLeft = payload.exp * 1000 - Date.now();
    if (msLeft < 12 * 60 * 60 * 1000)
      res.setHeader('x-refresh-token', signToken(payload.userId, payload.isAdmin, payload.isSuperAdmin));
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.isAdmin && !req.isSuperAdmin) return res.status(403).json({ error: 'Admin access required' });
  next();
}

module.exports = {
  generateToken, generateOtp, otpExpiry,
  signToken, verifyToken,
  signResetToken, verifyResetToken,
  hashPassword, comparePassword,
  sanitize, validateEmail, validatePassword,
  requireAuth, requireAdmin,
};
