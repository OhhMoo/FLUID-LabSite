import Image from "next/image";
import Link from "next/link";
import { pi } from "@/data/pi";
import { research } from "@/data/research";
import { publications } from "@/data/publications";
import { people } from "@/data/people";
import { Reveal, RevealGroup } from "@/components/Reveal";

const RECENT_COUNT = 5;

export default function Home() {
  const recent = publications.slice(0, RECENT_COUNT);
  const groupSize = people.postdoc.length + people.current.length;
  const oldest = publications[publications.length - 1].year;
  const newest = publications[0].year;

  return (
    <div className="container-narrow py-10 lg:py-16">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <article className="surface-card relative overflow-hidden p-6 sm:p-10 lg:p-12">
        <span
          aria-hidden="true"
          className="hero-glow pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, oklch(54% 0.215 262 / 0.10), transparent 70%)",
            filter: "blur(8px)",
          }}
        />

        <p className="eyebrow load-in mb-4">zhuang group · harvey mudd college</p>
        <h1
          className="display load-in text-balance"
          style={{ "--load-delay": "90ms" } as React.CSSProperties}
        >
          Statistical field theory for soft matter
        </h1>
        <p
          className="load-in mt-5 text-sm"
          style={
            {
              color: "var(--color-ink-3)",
              "--load-delay": "180ms",
            } as React.CSSProperties
          }
        >
          {pi.name} · {pi.title}
        </p>

        <div
          className="prose-body load-in mt-8 max-w-[62ch]"
          style={{ "--load-delay": "270ms" } as React.CSSProperties}
        >
          <p>
            This group builds field-theoretic and analytical theories for
            soft matter: the correlations that set the dielectric response of
            polar and polarizable liquids, the local ordering that makes water
            anomalous, the conformations polyelectrolyte brushes take in salt,
            and the demixing behind liquid–liquid phase separation. The
            derivations are tedious. The expressions they produce are usually
            simple.
          </p>
          <p>
            Most of the work is done with Harvey Mudd undergraduates, and they
            are named on the papers.
          </p>
        </div>

        <div
          className="load-in mt-7 flex flex-wrap items-center gap-x-3 gap-y-2"
          style={{ "--load-delay": "360ms" } as React.CSSProperties}
        >
          <a href={`mailto:${pi.email}`} className="btn">
            {pi.email}
          </a>
          <Link href="/research" className="btn btn-primary">
            Read the research
            <span aria-hidden="true" className="btn-arrow" style={{ opacity: 0.6 }}>
              →
            </span>
          </Link>
        </div>
      </article>

      {/* ── Research ─────────────────────────────────────────── */}
      <section className="mt-20 lg:mt-28">
        <header className="mb-10">
          <p className="eyebrow mb-3">research</p>
          <h2 className="display max-w-[24ch]">Four thrusts</h2>
        </header>

        <ol className="list-none space-y-8">
          <RevealGroup stagger={60}>
            {research.map((thrust, i) => (
              <Reveal as="li" key={thrust.slug} variant="up">
                <Link
                  href={`/research#${thrust.slug}`}
                  className="thrust-card group block max-w-[64ch]"
                >
                  <span className="thrust-numeral">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="h2 mt-2">
                    <span className="thrust-title-underline">{thrust.title}</span>
                  </h3>
                  <p
                    className="mt-2 small"
                    style={{ color: "var(--color-ink-2)" }}
                  >
                    {thrust.summary}
                  </p>
                </Link>
              </Reveal>
            ))}
          </RevealGroup>
        </ol>

        <figure className="mt-14">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <RevealGroup stagger={70}>
              {research.map((thrust, i) =>
                thrust.image ? (
                  <Reveal key={thrust.slug} variant="scale">
                    <div
                      className="fig-thumb relative aspect-square overflow-hidden rounded-xl"
                      style={{
                        background: "var(--color-bg)",
                        boxShadow:
                          "0 0 0 1px var(--color-rule), 0 12px 24px -16px oklch(20% 0.03 260 / 0.18)",
                      }}
                    >
                      <Image
                        src={thrust.image}
                        alt={thrust.imageAlt ?? thrust.title}
                        fill
                        sizes="(min-width: 640px) 240px, 45vw"
                        className="object-contain p-3"
                      />
                      <span aria-hidden="true" className="fig-caption">
                        Fig. 1{String.fromCharCode(97 + i)}
                      </span>
                    </div>
                    <p
                      className="mt-2 font-mono text-xs"
                      style={{ color: "var(--color-ink-4)" }}
                    >
                      ({String.fromCharCode(97 + i)})
                    </p>
                  </Reveal>
                ) : null,
              )}
            </RevealGroup>
          </div>
          <Reveal variant="fade" delay={150}>
            <figcaption
              className="mt-5 max-w-[62ch] small"
              style={{ color: "var(--color-ink-3)" }}
            >
              <span
                className="font-mono text-xs"
                style={{ color: "var(--color-ink-2)" }}
              >
                Fig. 1
              </span>{" "}
              Systems under study: (a) a cation in its shell of oriented solvent
              dipoles, (b) the hydrogen-bonded tetrahedron of water, (c) a
              polyelectrolyte brush and its counterions, (d) a phase-separated
              droplet.
            </figcaption>
          </Reveal>
        </figure>
      </section>

      {/* ── Publications ─────────────────────────────────────── */}
      <section className="mt-20 lg:mt-28">
        <header className="mb-8">
          <p className="eyebrow mb-3">publications</p>
          <h2 className="display">Most recent</h2>
          <p
            className="mt-3 font-mono text-xs"
            style={{
              color: "var(--color-ink-3)",
              fontFeatureSettings: '"tnum" on',
            }}
          >
            {publications.length} papers · {oldest}–{newest}
          </p>
        </header>

        <Reveal variant="rule">
          <hr className="hairline" />
        </Reveal>

        <ol className="list-none">
          <RevealGroup stagger={60}>
            {recent.map((p, i) => (
              <Reveal as="li" key={p.id} variant="up" className="pub-item">
                <div className="flex gap-4">
                  <span
                    className="pub-index flex-shrink-0 pt-1 font-mono text-xs"
                    style={{
                      color: "var(--color-ink-4)",
                      fontFeatureSettings: '"tnum" on',
                    }}
                  >
                    [{i + 1}]
                  </span>
                  <div className="min-w-0">
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-ink-3)" }}
                    >
                      {p.authors}
                    </p>
                    <h3 className="mt-1.5 text-base font-medium leading-snug text-[color:var(--color-ink)]">
                      <a
                        href={`https://doi.org/${p.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="pub-title"
                      >
                        {p.title}
                      </a>
                    </h3>
                    <p className="mt-1.5 small text-[color:var(--color-ink-2)]">
                      <span className="italic font-medium text-[color:var(--color-ink)]">
                        {p.venue}
                      </span>
                      <span style={{ color: "var(--color-ink-3)" }}>
                        {p.volume ? `, ${p.volume}` : ""}
                        {p.pages ? `, ${p.pages}` : ""} ({p.year})
                      </span>
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </RevealGroup>
        </ol>

        <p
          className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs"
          style={{ color: "var(--color-ink-3)" }}
        >
          <span>* corresponding author</span>
          <span>† equal contribution</span>
          <span>‡ undergraduate co-author</span>
        </p>

        <p className="mt-6 small">
          <Link href="/publications" className="link-underline">
            All {publications.length} publications
          </Link>
        </p>
      </section>

      {/* ── Group ────────────────────────────────────────────── */}
      <section className="mt-20 lg:mt-28">
        <header className="mb-6">
          <p className="eyebrow mb-3">group</p>
          <h2 className="display">Who is here</h2>
        </header>

        <div className="prose-body max-w-[62ch]">
          <p>
            {groupSize} researchers work in the group this term — one
            postdoctoral fellow and {people.current.length} Harvey Mudd
            undergraduates. Students join for a summer or a thesis year and stay
            on the papers that come out of it.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Link href="/team" className="btn">
            Everyone, including alumni
          </Link>
          <Link href="/bilin" className="btn">
            About Bilin
          </Link>
          <a href={`mailto:${pi.email}`} className="btn btn-primary">
            Ask about openings
          </a>
        </div>
      </section>
    </div>
  );
}
