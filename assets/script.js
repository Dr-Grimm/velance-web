/* ================================================================
   Velance Landing Page — script.js  (v2)
   ================================================================ */

/* ── THEME TOGGLE ─────────────────────────────────────────────── */
const html   = document.documentElement;
const toggle = document.getElementById('theme-toggle');
const KEY    = 'velance-theme';

function applyTheme(t) {
  html.setAttribute('data-theme', t);
  const ico = toggle.querySelector('svg');
  ico.innerHTML = t === 'dark'
    ? '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'
    : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>';
  localStorage.setItem(KEY, t);
}

applyTheme(localStorage.getItem(KEY) || 'light');
toggle.addEventListener('click', () =>
  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')
);

/* ── NAV SCROLL SHADOW ─────────────────────────────────────────── */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 16);
}, { passive: true });

/* ── SMOOTH SCROLL ─────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 84, behavior: 'smooth' });
  });
});

/* ── SCROLL REVEAL ─────────────────────────────────────────────── */
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

/* ── FAQ ACCORDION ─────────────────────────────────────────────── */
document.querySelectorAll('.faq__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq__item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq__item.open').forEach(i => i.classList.remove('open'));
    // Toggle clicked
    if (!isOpen) item.classList.add('open');
  });
});

/* ── LIVE RELEASE DATA ─────────────────────────────────────────── */
async function fetchRelease() {
  try {
    const r = await fetch('https://api.github.com/repos/Dr-Grimm/velance-app/releases/latest', {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!r.ok) return;
    const d = await r.json();
    document.querySelectorAll('[data-version]').forEach(el => { el.textContent = d.tag_name || el.textContent; });
    const asset = d.assets?.find(a => a.name.endsWith('.exe'));
    if (asset) {
      const mb = (asset.size / 1024 / 1024).toFixed(1);
      document.querySelectorAll('[data-size]').forEach(el => { el.textContent = mb + ' MB'; });
    }
  } catch {}
}
fetchRelease();

/* ── COUNTER ANIMATION ─────────────────────────────────────────── */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const dur    = 1600;
  const start  = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 4); // easeOutQuart
    const val  = target * ease;
    el.textContent = (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

/* ── BAR ANIMATION IN MOCK ─────────────────────────────────────── */
// Already handled by CSS @keyframes grow-bar
