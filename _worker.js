/**
 * Velance Web — Cloudflare Worker entrypoint
 *
 * Handles custom routes (e.g. /download) and falls through
 * to static asset serving for everything else.
 *
 * Works in both:
 *   - Cloudflare Pages (functions/ directory ignored when _worker.js exists)
 *   - Cloudflare Workers + Assets (wrangler.jsonc with "main": "_worker.js")
 */

const GITHUB_API = 'https://api.github.com/repos/Dr-Grimm/velance-app/releases/latest';
const FALLBACK   = 'https://github.com/Dr-Grimm/velance-app/releases/latest';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── /download ─────────────────────────────────────────────
    if (url.pathname === '/download') {
      try {
        const res = await fetch(GITHUB_API, {
          headers: {
            'Accept':     'application/vnd.github+json',
            'User-Agent': 'Velance-Web/1.0 (velance.org)',
          },
        });

        if (!res.ok) return Response.redirect(FALLBACK, 302);

        const release = await res.json();
        const asset   = release.assets?.find(a => a.name.endsWith('.exe'));

        if (!asset?.browser_download_url) return Response.redirect(FALLBACK, 302);

        return new Response(null, {
          status: 302,
          headers: {
            'Location':      asset.browser_download_url,
            'Cache-Control': 'no-store',
          },
        });
      } catch {
        return Response.redirect(FALLBACK, 302);
      }
    }

    // ── Everything else → serve static assets ─────────────────
    return env.ASSETS.fetch(request);
  },
};
