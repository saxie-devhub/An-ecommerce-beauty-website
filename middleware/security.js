// middleware/security.js - Input Validation & XSS/SQL Injection Prevention

function sanitizeHtml(input) {
  if (typeof input !== 'string') return input;
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return input.replace(/[&<>"'/]/g, (char) => entityMap[char] || char);
}

function sanitizeDeep(data) {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') return sanitizeHtml(data.trim());
  if (Array.isArray(data)) return data.map(sanitizeDeep);
  if (typeof data === 'object') {
    const cleanObj = {};
    for (const [key, value] of Object.entries(data)) {
      cleanObj[key] = sanitizeDeep(value);
    }
    return cleanObj;
  }
  return data;
}

function sanitizeInputMiddleware(req, res, next) {
  if (req.body && typeof req.body === 'object') req.body = sanitizeDeep(req.body);
  if (req.query && typeof req.query === 'object') req.query = sanitizeDeep(req.query);
  next();
}

const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(email).trim());
const validatePassword = (password) => typeof password === 'string' && password.length >= 8;
const validatePositiveNumber = (num) => !isNaN(Number(num)) && Number(num) >= 0;
const validateInteger = (num, min = 0, max = Infinity) => Number.isInteger(Number(num)) && Number(num) >= min && Number(num) <= max;

module.exports = {
  sanitizeHtml,
  sanitizeDeep,
  sanitizeInputMiddleware,
  validateEmail,
  validatePassword,
  validatePositiveNumber,
  validateInteger
};