"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const routes = [
  { href: "/bilin", label: "bilin" },
  { href: "/research", label: "research" },
  { href: "/publications", label: "publications" },
  { href: "/team", label: "team" },
];

const stripSlash = (p: string) => p.replace(/\/+$/, "") || "/";

export function SiteHeader() {
  const current = stripSlash(usePathname() ?? "/");
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const tickingRef = useRef(false);

  useEffect(() => {
    const update = () => {
      tickingRef.current = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const y = window.scrollY || doc.scrollTop;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (progressRef.current) {
        progressRef.current.style.setProperty("--p", String(p));
      }
      setScrolled(y > 4);
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header
      data-scrolled={scrolled}
      className="site-header fixed left-0 right-0 top-0 z-40 h-16 backdrop-blur-md transition-colors duration-200"
      style={{
        background: "var(--header-bg)",
        borderBottom: "1px solid var(--header-border)",
      }}
    >
      <div className="mx-auto flex h-full max-w-(--container-wide) items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex flex-shrink-0 items-center gap-2.5 rounded-sm text-[color:var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <span
            aria-hidden="true"
            className="relative h-2 w-2 rounded-full"
            style={{
              background: "var(--color-accent)",
              boxShadow: "0 0 0 4px oklch(54% 0.215 262 / 0.18)",
            }}
          />
          <span className="text-[15px] font-semibold tracking-[-0.02em] sm:text-[16px]">
            FLUID<span style={{ color: "var(--color-ink-3)", fontWeight: 400 }}>@</span>hmc
          </span>
        </Link>
        <nav
          aria-label="Primary"
          className="flex min-w-0 flex-wrap items-center justify-end gap-x-4 gap-y-1 sm:gap-x-6"
        >
          {routes.map((r) => {
            const isActive =
              current === r.href || (r.href === "/bilin" && current === "/");
            return (
              <Link
                key={r.href}
                href={r.href}
                aria-current={isActive ? "page" : undefined}
                className="nav-link"
              >
                {r.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <span ref={progressRef} className="scroll-progress" aria-hidden="true" />
    </header>
  );
}
