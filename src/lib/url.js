/**
 * Base-aware URL helpers.
 *
 * Astro serves this site from a sub-path on GitHub Pages (e.g.
 * /thaifoodproduct). Hardcoded links like `/products` are NOT auto-prefixed by
 * Astro, so every internal link must be wrapped with `withBase()`.
 */
const RAW_BASE = import.meta.env.BASE_URL || '/';
const BASE = RAW_BASE.replace(/\/$/, ''); // '' (root) or '/thaifoodproduct'

/** Prefix an internal path with the configured base. External/anchor links pass through. */
export function withBase(path = '/') {
  if (typeof path !== 'string') return path;
  if (/^(https?:|mailto:|tel:|#|\/\/)/.test(path)) return path;
  if (!path.startsWith('/')) path = '/' + path;
  return BASE + path || '/';
}

/** Remove the base prefix from a pathname (for active-link comparisons). */
export function stripBase(pathname = '/') {
  if (BASE && pathname.startsWith(BASE)) {
    return pathname.slice(BASE.length) || '/';
  }
  return pathname;
}
