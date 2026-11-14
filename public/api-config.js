// api-config.js - Central API configuration
// Same-origin requests work locally and after deployment without changing code.
// Store the shared base URL on window so page scripts can safely declare their
// own API_BASE constant without colliding with another classic script.
window.API_BASE = `${window.location.origin}/api`;
