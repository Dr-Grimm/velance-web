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

/* ── AUTH GATE ─────────────────────────────────────────────────── */
// ⚠️  Fill in your Supabase project details to enable the download gate.
//     Leave as-is to skip auth and allow direct downloads.
const SUPABASE_URL  = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON = 'YOUR_SUPABASE_ANON_KEY';

const AUTH_CONFIGURED = SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON !== 'YOUR_SUPABASE_ANON_KEY';

let sb = null;
if (AUTH_CONFIGURED) {
  try { sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON); }
  catch (e) { console.warn('[Velance] Supabase init failed:', e); }
}

// ── DOM refs ────────────────────────────────────────────────────
const authModal    = document.getElementById('auth-modal');
const authOverlay  = authModal?.querySelector('.auth-modal__overlay');
const authCloseBtn = document.getElementById('auth-close');
const authForm     = document.getElementById('auth-form');
const authEmail    = document.getElementById('auth-email');
const authPass     = document.getElementById('auth-pass');
const authSubmit   = document.getElementById('auth-submit');
const authGoogle   = document.getElementById('auth-google');
const authModeBtn  = document.getElementById('auth-mode-btn');
const authModePrefix = document.getElementById('auth-mode-prefix');
const authError    = document.getElementById('auth-error');
const authSuccess  = document.getElementById('auth-success');
const authTitle    = document.getElementById('auth-title');
const authSub      = document.getElementById('auth-sub');

let isSignup = true;

// ── Helpers ────────────────────────────────────────────────────
function openAuthModal() {
  authModal?.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => authEmail?.focus(), 120);
}
function closeAuthModal() {
  authModal?.classList.remove('open');
  document.body.style.overflow = '';
  clearAuthMsgs();
}
function clearAuthMsgs() {
  [authError, authSuccess].forEach(el => el?.classList.remove('visible'));
}
function showAuthError(msg) {
  clearAuthMsgs();
  if (authError) { authError.textContent = msg; authError.classList.add('visible'); }
}
function showAuthSuccess(msg) {
  clearAuthMsgs();
  if (authSuccess) { authSuccess.textContent = msg; authSuccess.classList.add('visible'); }
}
function setBusy(on) {
  if (authSubmit) {
    authSubmit.disabled = on;
    authSubmit.textContent = on ? 'Please wait…' : (isSignup ? 'Create free account' : 'Sign in');
  }
  if (authGoogle) authGoogle.disabled = on;
}
function switchAuthMode(signup) {
  isSignup = signup;
  clearAuthMsgs();
  if (authTitle)      authTitle.textContent = signup ? 'Get Velance free' : 'Welcome back';
  if (authSub)        authSub.textContent   = signup ? 'Create a free account to download' : 'Sign in to download Velance';
  if (authSubmit)     authSubmit.textContent = signup ? 'Create free account' : 'Sign in';
  if (authModePrefix) authModePrefix.textContent = signup ? 'Already have an account? ' : "Don't have an account? ";
  if (authModeBtn)    authModeBtn.textContent    = signup ? 'Sign in' : 'Sign up free';
  if (authPass)       authPass.autocomplete = signup ? 'new-password' : 'current-password';
}

// ── Event listeners ────────────────────────────────────────────
authOverlay?.addEventListener('click', closeAuthModal);
authCloseBtn?.addEventListener('click', closeAuthModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && authModal?.classList.contains('open')) closeAuthModal();
});
authModeBtn?.addEventListener('click', () => switchAuthMode(!isSignup));

// Google OAuth
authGoogle?.addEventListener('click', async () => {
  if (!sb) { showAuthError('Auth service unavailable. Please try again.'); return; }
  setBusy(true); clearAuthMsgs();
  try {
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/download` }
    });
    if (error) { showAuthError(error.message); setBusy(false); }
    // else browser redirects to Google → back to /download
  } catch { showAuthError('Something went wrong. Please try again.'); setBusy(false); }
});

// Email / Password form
authForm?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!sb) { showAuthError('Auth service unavailable. Please try again.'); return; }

  const email = authEmail?.value.trim();
  const pass  = authPass?.value;
  if (!email || !pass) { showAuthError('Please fill in all fields.'); return; }
  if (isSignup && pass.length < 8) { showAuthError('Password must be at least 8 characters.'); return; }

  setBusy(true); clearAuthMsgs();
  try {
    if (isSignup) {
      const { data, error } = await sb.auth.signUp({
        email, password: pass,
        options: { emailRedirectTo: `${location.origin}/download` }
      });
      if (error) { showAuthError(error.message); setBusy(false); return; }

      if (data.session) {
        // Email confirm disabled — logged in immediately
        closeAuthModal();
        location.href = '/download';
      } else {
        // Confirmation email sent
        showAuthSuccess('Almost there! Check your inbox and click the verification link — your download will start automatically.');
        setBusy(false);
      }
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password: pass });
      if (error) { showAuthError(error.message); setBusy(false); return; }
      closeAuthModal();
      location.href = '/download';
    }
  } catch { showAuthError('Something went wrong. Please try again.'); setBusy(false); }
});

// Intercept all download-triggering links
async function handleDownloadClick(e) {
  e.preventDefault();

  // If Supabase not configured → just navigate
  if (!sb) { location.href = '/download'; return; }

  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      location.href = '/download';
    } else {
      openAuthModal();
    }
  } catch {
    location.href = '/download';
  }
}

document.querySelectorAll('a[href="/download"]').forEach(a =>
  a.addEventListener('click', handleDownloadClick)
);
