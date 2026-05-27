/**
 * Cloudflare Pages Function — /download
 *
 * Fetches the latest Velance release from GitHub and redirects the user
 * directly to the .exe installer asset download URL.
 * Falls back to the GitHub releases page if no asset is found.
 */
export async function onRequest(context) {
  const GITHUB_API = 'https://api.github.com/repos/Dr-Grimm/velance-app/releases/latest';
  const FALLBACK    = 'https://github.com/Dr-Grimm/velance-app/releases/latest';

  try {
    const response = await fetch(GITHUB_API, {
      headers: {
        'Accept':     'application/vnd.github+json',
        'User-Agent': 'Velance-Web/1.0 (velance.org)',
      },
    });

    if (!response.ok) {
      return Response.redirect(FALLBACK, 302);
    }

    const release = await response.json();
    const asset   = release.assets?.find((a) => a.name.endsWith('.exe'));

    if (!asset?.browser_download_url) {
      return Response.redirect(FALLBACK, 302);
    }

    // Add CORS headers for analytics / referrer tracking if needed
    return new Response(null, {
      status: 302,
      headers: {
        Location:      asset.browser_download_url,
        'Cache-Control': 'no-store',
      },
    });
  } catch (_err) {
    return Response.redirect(FALLBACK, 302);
  }
}
