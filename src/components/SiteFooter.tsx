import { pi } from "@/data/pi";
import { GithubIcon } from "./icons";

const GROUP_GITHUB = "https://github.com/HMC-FLUID-Lab";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="relative z-10 mt-20 border-t"
      style={{ borderColor: "var(--color-rule)" }}
    >
      <div className="container-wide flex flex-col gap-3 py-10 small sm:flex-row sm:items-center sm:justify-between">
        <p
          className="text-xs"
          style={{
            color: "var(--color-ink-3)",
            letterSpacing: "-0.005em",
          }}
        >
          <span style={{ color: "var(--color-ink-2)", fontWeight: 500 }}>
            Zhuang Group
          </span>
          {" · "}Department of Chemistry · Harvey Mudd College, Claremont CA
        </p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <a href={`mailto:${pi.email}`} className="link-underline">
            {pi.email}
          </a>
          <span aria-hidden="true" style={{ color: "var(--color-ink-4)" }}>
            ·
          </span>
          <a
            href={pi.cvUrl}
            target="_blank"
            rel="noreferrer"
            className="link-underline"
          >
            CV
          </a>
          <span aria-hidden="true" style={{ color: "var(--color-ink-4)" }}>
            ·
          </span>
          <a
            href={GROUP_GITHUB}
            target="_blank"
            rel="noreferrer"
            aria-label="Group GitHub"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[color:var(--color-accent)]"
            style={{ color: "var(--color-ink-3)" }}
          >
            <GithubIcon size={13} />
            <span>GitHub</span>
          </a>
          <span aria-hidden="true" style={{ color: "var(--color-ink-4)" }}>
            ·
          </span>
          <span style={{ color: "var(--color-ink-3)" }}>© {year}</span>
        </p>
      </div>
    </footer>
  );
}
