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
    <div className="container-wide py-8">
      <Reveal as="article" className="surface-card p-6 sm:p-8">
        <header className="mb-12">
          <SectionNumber n={2} />
          <h1 className="section-h2 mt-3">research</h1>
          <p className="mt-4 max-w-2xl text-[color:var(--color-ink-2)]">
            Four ongoing thrusts at the intersection of statistical
            thermodynamics and soft-matter chemical physics.
          </p>
        </header>

        <div className="space-y-12">
          {research.map((thrust, i) => {
            const keyPubs = thrust.keyPublicationDois
              .map((doi) => publications.find((p) => p.doi === doi))
              .filter((p): p is NonNullable<typeof p> => p !== undefined);
            return (
              <Reveal
                key={thrust.slug}
                as="article"
                id={thrust.slug}
                delay={i * 80}
                className="thrust-card scroll-mt-20 border-t border-[color:var(--color-rule)] pt-8 first:border-t-0 first:pt-0"
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                  {thrust.image ? (
                    <figure className="flex-shrink-0">
                      <div className="thrust-thumb relative h-40 w-40 overflow-hidden rounded-lg bg-white">
                        <Image
                          src={thrust.image}
                          alt={thrust.imageAlt ?? thrust.title}
                          fill
                          sizes="160px"
                          className="object-contain p-2"
                        />
                      </div>
                    </figure>
                  ) : null}

                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex items-baseline gap-3">
                      <span className="font-mono text-sm text-[color:var(--color-accent)]">
                        R-{String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h2 className="h2 max-w-3xl">
                      <span className="thrust-title-underline">
                        {thrust.title}
                      </span>
                    </h2>
                    <div className="prose-body mt-4 max-w-prose space-y-4">
                      {thrust.fullDescription.map((para, j) => (
                        <p key={j}>{para}</p>
                      ))}
                    </div>
                    {keyPubs.length > 0 ? (
                      <div className="mt-5">
                        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-[color:var(--color-ink-3)]">
                          Key publications
                        </p>
                        <ul className="space-y-1">
                          {keyPubs.map((p) => (
                            <li key={p.id} className="small">
                              <a
                                href={`https://doi.org/${p.doi}`}
                                target="_blank"
                                rel="noreferrer"
                                className="link-underline"
                              >
                                {p.title}
                              </a>
                              <span className="text-[color:var(--color-ink-3)]">
                                {" "}
                                · {p.venue} ({p.year})
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
      </Reveal>
    </div>
  );
}
