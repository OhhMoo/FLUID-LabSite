import Image from "next/image";
import { pi, affiliations, awards } from "@/data/pi";
import { Timeline } from "./Timeline";
import { Reveal } from "./Reveal";

export function PIProfile() {
  return (
    <article className="surface-card relative overflow-hidden p-6 sm:p-10 lg:p-12">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, oklch(54% 0.215 262 / 0.10), transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      <header className="mb-10 lg:mb-12">
        <p className="eyebrow mb-4">
          principal investigator · zhuang group
        </p>
        <h1 className="display-2xl">{pi.name}</h1>
        <p
          className="mt-4 max-w-[58ch] text-sm"
          style={{ color: "var(--color-ink-3)" }}
        >
          {pi.title} · {pi.affiliation}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1.6fr)] lg:gap-14">
        <Reveal variant="scale" delay={120}>
          <figure className="halo">
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-2xl"
              style={{
                boxShadow:
                  "0 1px 0 oklch(100% 0 0 / 0.6) inset, 0 0 0 1px var(--color-rule), 0 24px 48px -16px oklch(20% 0.03 260 / 0.18)",
              }}
            >
              {pi.portrait ? (
                <Image
                  src={pi.portrait}
                  alt={pi.name}
                  fill
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="object-cover"
                  priority
                />
              ) : null}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 60%, oklch(18% 0.012 260 / 0.18))",
                }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.04]"
                style={{
                  backgroundImage:
                    "radial-gradient(1px 1px at 50% 50%, currentColor 1px, transparent 0)",
                  backgroundSize: "3px 3px",
                  color: "var(--color-ink)",
                }}
              />
            </div>
            <figcaption
              className="mt-3 flex items-center gap-2 text-xs"
              style={{
                color: "var(--color-ink-3)",
                letterSpacing: "-0.005em",
              }}
            >
              <span
                aria-hidden="true"
                className="h-px w-6"
                style={{ background: "var(--color-rule-2)" }}
              />
              <span>Portrait, 2024</span>
            </figcaption>
          </figure>
        </Reveal>

        <div>
          <Reveal variant="up" delay={180}>
            <div className="prose-body">
              {pi.bio.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </Reveal>

          <Reveal variant="fade" delay={420}>
            <div
              className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm"
              style={{ color: "var(--color-ink-2)" }}
            >
              <a href={`mailto:${pi.email}`} className="btn">
                {pi.email}
              </a>
              <a
                href={pi.cvUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                Download CV
                <span aria-hidden="true" style={{ opacity: 0.6 }}>
                  ↗
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-2 lg:gap-14">
        <Reveal variant="up" delay={80}>
          <Timeline heading="Affiliations" rows={affiliations} />
        </Reveal>
        <Reveal variant="up" delay={160}>
          <Timeline heading="Awards & Recognition" rows={awards} />
        </Reveal>
      </div>
    </article>
  );
}
