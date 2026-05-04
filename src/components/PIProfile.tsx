import Image from "next/image";
import { pi, affiliations, awards } from "@/data/pi";
import { Timeline } from "./Timeline";
import { Reveal } from "./Reveal";

export function PIProfile() {
  return (
    <Reveal as="article" className="surface-card p-6 sm:p-8">
      <h1 className="h1 mb-10 text-center">{pi.name}</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-1/3">
          <div className="relative aspect-square overflow-hidden rounded-xl">
            {pi.portrait ? (
              <Image
                src={pi.portrait}
                alt={pi.name}
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover"
                priority
              />
            ) : null}
          </div>
        </div>

        <div className="prose-body lg:w-2/3">
          {pi.bio.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-sm">
            <a
              href={`mailto:${pi.email}`}
              className="link-underline text-[color:var(--color-ink-2)]"
            >
              {pi.email}
            </a>
            <span aria-hidden="true" className="text-[color:var(--color-ink-3)]">
              ·
            </span>
            <a
              href={pi.cvUrl}
              target="_blank"
              rel="noreferrer"
              className="link-underline text-[color:var(--color-ink-2)]"
            >
              CV (PDF)
            </a>
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <Timeline heading="Affiliations" rows={affiliations} />
        <Timeline heading="Awards & Recognition" rows={awards} />
      </div>
    </Reveal>
  );
}
