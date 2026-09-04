import Image from "next/image";
import { pi, education, appointments, awards } from "@/data/pi";
import { talks } from "@/data/talks";
import { Timeline } from "./Timeline";
import { Reveal } from "./Reveal";

/** A dated list that borrows Timeline's grammar for non-TimelineRow content. */
function DatedList({
  heading,
  items,
}: {
  heading: string;
  items: Array<{
    key: string;
    when: string;
    title: React.ReactNode;
    meta?: React.ReactNode;
    note?: string;
  }>;
}) {
  return (
    <section>
      <h2 className="h2 mb-6 flex items-baseline gap-3">
        <span>{heading}</span>
        <span
          aria-hidden="true"
          className="font-mono text-xs"
          style={{ color: "var(--color-ink-4)" }}
        >
          [{String(items.length).padStart(2, "0")}]
        </span>
      </h2>
      <ul
        className="relative space-y-4 border-l pl-5"
        style={{ borderColor: "var(--color-rule)" }}
      >
        {items.map((item) => (
          <li
            key={item.key}
            className="relative grid grid-cols-[6.25rem_1fr] items-start gap-4"
          >
            <span
              aria-hidden="true"
              className="absolute -left-[1.45rem] top-2 h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--color-accent)" }}
            />
            <span
              className="pt-px text-right font-mono text-xs"
              style={{
                color: "var(--color-ink-3)",
                fontFeatureSettings: '"tnum" on',
              }}
            >
              {item.when}
            </span>
            <div className="min-w-0">
              <p className="font-medium text-[color:var(--color-ink)]">
                {item.title}
              </p>
              {item.meta ? (
                <p className="small text-[color:var(--color-ink-2)]">
                  {item.meta}
                </p>
              ) : null}
              {item.note ? (
                <p className="mt-1 small italic text-[color:var(--color-ink-3)]">
                  {item.note}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PIProfile() {
  return (
    <>
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
          <p className="eyebrow load-in mb-4">principal investigator · zhuang group</p>
          <h1
            className="display-2xl load-in"
            style={{ "--load-delay": "90ms" } as React.CSSProperties}
          >
            {pi.name}
          </h1>
          <p
            className="load-in mt-4 max-w-[58ch] text-sm"
            style={
              {
                color: "var(--color-ink-3)",
                "--load-delay": "180ms",
              } as React.CSSProperties
            }
          >
            {pi.title} · {pi.affiliation}
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1.6fr)] lg:gap-14">
          <figure
            className="halo load-in"
            style={{ "--load-delay": "360ms" } as React.CSSProperties}
          >
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

          <div>
            <div
              className="prose-body load-in"
              style={{ "--load-delay": "270ms" } as React.CSSProperties}
            >
              {pi.bio.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div
              className="load-in mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm"
              style={
                {
                  color: "var(--color-ink-2)",
                  "--load-delay": "450ms",
                } as React.CSSProperties
              }
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
                <span aria-hidden="true" className="btn-arrow" style={{ opacity: 0.6 }}>
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-2 lg:gap-14">
          <Reveal variant="up" delay={80}>
            <Timeline heading="Education" rows={education} />
          </Reveal>
          <Reveal variant="up" delay={160}>
            <Timeline heading="Appointments" rows={appointments} />
          </Reveal>
        </div>

        {/* Awards and talks run as a pair, three each, so the two
            columns stay short and end together. The full record lives
            in the CV. */}
        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-2 lg:gap-14">
          <Reveal variant="up" delay={80}>
            <Timeline heading="Awards & Recognition" rows={awards.slice(0, 3)} />
          </Reveal>
          <Reveal variant="up" delay={160}>
            <DatedList
              heading="Talks & Presentations"
              items={talks.slice(0, 3).map((t) => ({
                key: t.id,
                when: String(t.year),
                title: (
                  <>
                    {t.title}
                    {t.invited ? (
                      <span
                        className="ml-2 align-middle font-mono text-[0.625rem] uppercase tracking-[0.12em]"
                        style={{ color: "var(--color-accent)" }}
                      >
                        invited
                      </span>
                    ) : null}
                  </>
                ),
                meta: `${t.venue} · ${t.location}`,
              }))}
            />
          </Reveal>
        </div>
      </article>
    </>
  );
}
