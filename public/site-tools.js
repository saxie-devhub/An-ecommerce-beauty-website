// site-tools.js - PERMANENT FIX for auth pages

// Check if we're on login or signup page
const isAuthPage = window.location.pathname.includes('login') || 
                   window.location.pathname.includes('signup');

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    topNote: '✨ Nairobi pickup available · DM us for the cutest finds',
    announcement: '✨ Free Nairobi pickup available · Cute things, tiny prices',
    reviewNote: '✦ Real words from the Gleam girls',
    home: 'Home',
    shop: 'Shop',
    about: 'About',
    reviews: 'Reviews',
    contact: 'Contact',
    profile: 'Profile',
    backHome: '← Home',
    heroKicker: 'Kenyan girl-owned · made to shine',
    heroTitle: '✨ Glow Up with<br><span>Aesthetic Girly Gleam</span> ✨',
    collection: 'The <strong>Baddie Collection</strong> · just for you',
    heroText: 'Affordable accessories &amp; skincare for the modern girl. Your baddie era starts with the little details.',
    shopNow: 'Shop Now <b>→</b>',
    explore: 'Explore styles',
    promise: '<span>✦</span> Cute finds · Kind prices · Big energy'
  },
  sw: {
    topNote: '✨ Kuchukua bidhaa Nairobi kunapatikana · Tutumie DM kwa vitu vya kupendeza',
    announcement: '✨ Kuchukua bidhaa Nairobi bila malipo · Vitu vya kupendeza, bei ndogo',
    reviewNote: '✦ Maneno halisi kutoka kwa Gleam girls',
    home: 'Nyumbani',
    shop: 'Duka',
    about: 'Kuhusu',
    reviews: 'Maoni',
    contact: 'Wasiliana',
    profile: 'Wasifu',
    backHome: '← Nyumbani',
    heroKicker: 'Biashara inayomilikiwa na msichana wa Kenya · imetengenezwa kung\'aa',
    heroTitle: '✨ Ng\'aa zaidi ukiwa na<br><span>Aesthetic Girly Gleam</span> ✨',
    collection: '<strong>Baddie Collection</strong> · kwa ajili yako tu',
    heroText: 'Vifaa na bidhaa za ngozi za bei nafuu kwa msichana wa kisasa. Enzi yako ya kung\'aa inaanza na mambo madogo.',
    shopNow: 'Nunua sasa <b>→</b>',
    explore: 'Chunguza mitindo',
    promise: '<span>✦</span> Vitu vya kupendeza · Bei rafiki · Nguvu kubwa'
  },
  sheng: {
    topNote: '✨ Nairobi pickup iko · DM sisi for the cutest finds ✨',
    announcement: '✨ Free Nairobi pickup iko · Vitu za cute, bei ndogo ndogo',
    reviewNote: '✦ Maneno ya true kutoka Gleam girls',
    home: 'Nyumbani',
    shop: 'Duka',
    about: 'About',
    reviews: 'Reviews',
    contact: 'Contact',
    profile: 'Profile',
    backHome: '← Nyumbani',
    heroKicker: 'Bosslady wa Kenya · made to shine',
    heroTitle: '✨ Glow Up na<br><span>Aesthetic Girly Gleam</span> ✨',
    collection: 'The <strong>Baddie Collection</strong> · just for you',
    heroText: 'Vitu za bei poa na skincare for the modern girl. Your baddie era inaanza na vitu za kawaida.',
    shopNow: 'Shop Now <b>→</b>',
    explore: 'Angalia styles',
    promise: '<span>✦</span> Vitu za cute · Bei poa · Big energy'
  }
};

// ============================================
// FUNCTIONS
// ============================================

function savePreference(key, value) {
  try { localStorage.setItem(key, value); } catch { /* silent */ }
}

function loadPreference(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

function applyLanguage(language) {
  const copy = translations[language] || translations.en;
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const value = copy[element.dataset.i18n];
    if (value) element.innerHTML = value;
  });
  document.querySelectorAll('.language-select').forEach(select => { 
    if (select) select.value = language; 
  });
  savePreference('agg-language', language);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-toggle').forEach(button => {
    if (button) {
      const isDark = theme === 'dark';
      button.textContent = isDark ? '☀️' : '🌙';
      button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  });
  savePreference('agg-theme', theme);
}

// ============================================
// ✅ ONLY RUN ON NON-AUTH PAGES
// ============================================

// ⚠️ CRITICAL: Skip theme/language on login/signup pages
if (!isAuthPage) {
  
  // Initialize only once
  if (!window._siteToolsInitialized) {
    window._siteToolsInitialized = true;

    const savedLanguage = loadPreference('agg-language', 'en');
    const savedTheme = loadPreference('agg-theme', 'light');
    
    applyLanguage(savedLanguage);
    applyTheme(savedTheme);

    // Language selector
    document.querySelectorAll('.language-select').forEach(select => {
      select.value = savedLanguage;
      select.addEventListener('change', function(e) {
        e.stopPropagation();
        applyLanguage(e.target.value);
      });
    });

    // Theme toggle
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
      });
    });
  }

  // Mobile menu (only on non-auth pages)
  const menuBtn = document.getElementById('menuButton');
  const nav = document.getElementById('mainNav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      nav.classList.toggle('open');
      this.textContent = nav.classList.contains('open') ? '✕' : '☰';
    });
  }
}

console.log(`✅ site-tools.js loaded (Auth page: ${isAuthPage})`);