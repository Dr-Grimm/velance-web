# velance-web

Landing page for [velance.org](https://velance.org) — deployed via Cloudflare Pages.

## Structure

```
velance-web/
├── index.html           # Main landing page
├── assets/
│   ├── style.css        # All styles (CSS variables for light/dark theme)
│   ├── script.js        # Theme toggle, scroll animations, dynamic version fetch
│   └── velance.svg      # App logo
└── functions/
    └── download.js      # Cloudflare Pages Function: redirects /download to latest .exe
```

## Download Flow

`/download` → `functions/download.js` → GitHub API (latest release) → `.exe` asset URL

## Deployment

Connected to Cloudflare Pages. Auto-deploys on push to `main`.
Custom domain: `velance.org`
