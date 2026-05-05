import type { Metadata } from "next";
import Image from "next/image";
import { research } from "@/data/research";
import { publications } from "@/data/publications";
import { SectionNumber } from "@/components/SectionNumber";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "research-fluid",
  description:
    "Statistical field theory for polar liquids, water structure, polyelectrolyte brushes, and liquid-liquid phase separation.",
};

export default function ResearchPage() {
  return (
    <div className="container-narrow py-10 lg:py-16">
      <header className="mb-14 lg:mb-20">
        <SectionNumber n={2} />
        <h1 className="display mt-5">research</h1>
        <p className="mt-5 max-w-[58ch] prose-body">
          Four ongoing thrusts at the intersection of statistical thermodynamics
          and soft-matter chemical physics — derivations are tedious, but the
          resulting expressions are often simple.
        </p>
      </header>

      <div className="space-y-20 lg:space-y-28">
        {research.map((thrust, i) => {
          const keyPubs = thrust.keyPublicationDois
            .map((doi) => publications.find((p) => p.doi === doi))
            .filter((p): p is NonNullable<typeof p> => p !== undefined);
          return (
            <Reveal
              key={thrust.slug}
              as="article"
              id={thrust.slug}
              delay={i * 60}
              className="thrust-card scroll-mt-20"
            >
              <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10 lg:gap-14">
                <div className="flex flex-shrink-0 flex-row items-start gap-6 sm:w-44 sm:flex-col sm:gap-5">
                  <span className="thrust-numeral">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {thrust.image ? (
                    <figure className="flex-shrink-0">
                      <div
                        className="thrust-thumb relative h-32 w-32 overflow-hidden rounded-xl sm:h-40 sm:w-40"
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
                          sizes="160px"
                          className="object-contain p-2.5"
                        />
                      </div>
                    </figure>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="eyebrow mb-3">
                    thrust · R-{String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="h2 max-w-[32ch] text-[clamp(1.5rem,2.6vw,1.875rem)]">
                    <span className="thrust-title-underline">
                      {thrust.title}
                    </span>
                  </h2>
                  <div className="prose-body mt-5 max-w-[62ch] space-y-4">
                    {thrust.fullDescription.map((para, j) => (
                      <p key={j}>{para}</p>
                    ))}
                  </div>
                  {keyPubs.length > 0 ? (
                    <div
                      className="mt-7 border-t pt-5"
                      style={{ borderColor: "var(--color-rule)" }}
                    >
                      <p className="mono-label mb-3">key publications</p>
                      <ul className="space-y-2">
                        {keyPubs.map((p, k) => (
                          <li key={p.id} className="small flex gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full"
                              style={{
                                background: "var(--color-accent)",
                                opacity: 0.6 + 0.13 * k,
                              }}
                            />
                            <span>
                              <a
                                href={`https://doi.org/${p.doi}`}
                                target="_blank"
                                rel="noreferrer"
                                className="link-underline"
                              >
                                {p.title}
                              </a>{" "}
                              <span style={{ color: "var(--color-ink-3)" }}>
                                · {p.venue} ({p.year})
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
