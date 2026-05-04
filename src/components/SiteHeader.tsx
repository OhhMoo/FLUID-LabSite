import Link from "next/link";

const routes = [
  { href: "/bilin", label: "bilin" },
  { href: "/research", label: "research" },
  { href: "/publications", label: "publications" },
  { href: "/team", label: "team" },
];

export function SiteHeader() {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-[color:var(--color-rule)] backdrop-blur-sm"
      style={{
        background: "rgba(255, 255, 255, 0.85)",
        fontFamily: "var(--font-mono)",
      }}
    >
      <div className="mx-auto flex h-full max-w-(--container-wide) items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-sm text-[color:var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <span className="font-mono text-base font-medium tracking-tight sm:text-lg">
            FLUID@hmc
          </span>
        </Link>
        <nav
          aria-label="Primary"
          className="hidden flex-wrap items-center gap-x-5 sm:flex"
        >
          {routes.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="font-mono text-sm text-[color:var(--color-ink-2)] transition-colors hover:text-[color:var(--color-accent)]"
            >
              {r.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
