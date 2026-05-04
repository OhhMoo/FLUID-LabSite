import { pi } from "@/data/pi";
import { Reveal } from "./Reveal";
import { GithubIcon } from "./icons";

const GROUP_GITHUB = "https://github.com/HMC-FLUID-Lab";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 mt-12 border-t border-[color:var(--color-rule)]">
      <Reveal className="container-wide flex flex-col gap-2 py-8 small text-[color:var(--color-ink-3)] sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono">
          zhuang group · department of chemistry · harvey mudd college, claremont CA
        </p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
          <a href={`mailto:${pi.email}`} className="link-underline">
            {pi.email}
          </a>
          <span aria-hidden="true">·</span>
          <a
            href={pi.cvUrl}
            target="_blank"
            rel="noreferrer"
            className="link-underline"
          >
            CV
          </a>
          <span aria-hidden="true">·</span>
          <a
            href={GROUP_GITHUB}
            target="_blank"
            rel="noreferrer"
            aria-label="Group GitHub"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[color:var(--color-accent)]"
          >
            <GithubIcon size={14} />
            <span>github</span>
          </a>
          <span aria-hidden="true">·</span>
          <span>© {year}</span>
        </p>
      </Reveal>
    </footer>
  );
}
