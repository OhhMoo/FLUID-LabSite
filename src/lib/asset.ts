/**
 * Build-time absolute URL for a public asset.
 *
 * Next.js auto-prefixes basePath for `<Link>` and CSS-emitted assets, but
 * `<Image src>` (with images.unoptimized) and plain `<a href>` to a public
 * file are passed through verbatim, so we prepend NEXT_PUBLIC_BASE_PATH
 * ourselves. Inlined at build time by webpack so it's free at runtime.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}
