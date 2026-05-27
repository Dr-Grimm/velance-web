/* ============================================================
   Velance Landing Page — script.js
   ============================================================ */

// === THEME TOGGLE ===========================================
const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const THEME_KEY = 'velance-theme';

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  const icon = themeToggle.querySelector('svg');
  if (theme === 'dark') {
    icon.innerHTML = `
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>`;
  } else {
    icon.innerHTML = `
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41
               M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>`;
  }
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const current = html.getAttribute('data-theme') || 'light';
  applyTheme(current === 'light' ? 'dark' : 'light');
}

// Init theme from storage (default: light)
const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
applyTheme(savedTheme);

themeToggle.addEventListener('click', toggleTheme);


// === SCROLL REVEAL ==========================================
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => revealObserver.observe(el));


// === DYNAMIC VERSION FROM GITHUB RELEASES ==================
async function fetchLatestRelease() {
  try {
    const res = await fetch(
      'https://api.github.com/repos/Dr-Grimm/velance-app/releases/latest',
      { headers: { Accept: 'application/vnd.github+json' } }
    );
    if (!res.ok) return;
    const data = await res.json();

    // Update version badges
    const versionEls = document.querySelectorAll('[data-release-version]');
    versionEls.forEach((el) => { el.textContent = data.tag_name || el.textContent; });

    // Update installer size
    const asset = data.assets?.find((a) => a.name.endsWith('.exe'));
    if (asset) {
      const sizeMB = (asset.size / 1024 / 1024).toFixed(1);
      const sizeEls = document.querySelectorAll('[data-release-size]');
      sizeEls.forEach((el) => { el.textContent = `${sizeMB} MB`; });
    }
  } catch (_) {
    // Silently fail — static fallback text already in HTML
  }
}

fetchLatestRelease();


// === SMOOTH SCROLL FOR NAV LINKS ===========================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // nav height + buffer
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


// === NAV SCROLL SHADOW =====================================
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    nav.style.boxShadow = 'var(--shadow-sm)';
  } else {
    nav.style.boxShadow = 'none';
  }
}, { passive: true });
