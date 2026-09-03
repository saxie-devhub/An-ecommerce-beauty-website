// api-config.js - Central API configuration
// Same-origin requests work locally and after deployment without changing code.
const API_BASE = `${window.location.origin}/api`;

// Make it available globally
window.API_BASE = API_BASE;
