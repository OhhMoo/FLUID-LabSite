"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  { href: "/bilin", label: "bilin" },
  { href: "/research", label: "research" },
  { href: "/publications", label: "publications" },
  { href: "/team", label: "team" },
];

// trailingSlash: true in next.config means usePathname() returns "/bilin/".
// Strip trailing slashes so route comparison is robust either way.
const stripSlash = (p: string) => p.replace(/\/+$/, "") || "/";

export function SiteHeader() {
  const current = stripSlash(usePathname() ?? "/");
  return (
    <header
      className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-[color:var(--color-rule)] backdrop-blur-sm"
      style={{
        background: "rgba(255, 255, 255, 0.85)",
        fontFamily: "var(--font-mono)",
      }}
    >
      <div className="mx-auto flex h-full max-w-(--container-wide) items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex flex-shrink-0 items-center gap-3 rounded-sm text-[color:var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <span className="font-mono text-base font-medium tracking-tight sm:text-lg">
            FLUID@hmc
          </span>
        </Link>
        <nav
          aria-label="Primary"
          className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 sm:gap-x-5"
        >
          {routes.map((r) => {
            const isActive =
              current === r.href || (r.href === "/bilin" && current === "/");
            return (
              <Link
                key={r.href}
                href={r.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  "relative font-mono text-xs transition-colors hover:text-[color:var(--color-accent)] sm:text-sm " +
                  (isActive
                    ? "font-medium after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px after:bg-[color:var(--color-accent)] after:content-['']"
                    : "")
                }
                style={{
                  color: isActive
                    ? "var(--color-ink)"
                    : "var(--color-ink-2)",
                }}
              >
                {r.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
