import type { Metadata } from "next";
import { publications } from "@/data/publications";
import { PublicationsList } from "@/components/PublicationsList";
import { SectionNumber } from "@/components/SectionNumber";

export const metadata: Metadata = {
  title: "publications-fluid",
  description: "Complete list of publications from the FLUID Lab, 2010–2025.",
};

export default function PublicationsPage() {
  const oldest = publications[publications.length - 1].year;
  const newest = publications[0].year;
  return (
    <div className="container-narrow py-10 lg:py-16">
      <header className="mb-12 lg:mb-16">
        <SectionNumber n={2} />
        <h1 className="display mt-5">publications</h1>
        <p
          className="mt-5 flex flex-wrap items-baseline gap-x-2 text-sm"
          style={{
            color: "var(--color-ink-3)",
            letterSpacing: "-0.005em",
          }}
        >
          <span
            style={{
              color: "var(--color-ink)",
              fontWeight: 500,
              fontFamily: "var(--font-mono)",
              fontVariantNumeric: "tabular-nums lining-nums",
            }}
          >
            {publications.length}
          </span>
          <span>papers</span>
          <span aria-hidden="true" style={{ color: "var(--color-ink-4)" }}>
            ·
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums lining-nums" }}>
            {oldest}–{newest}
          </span>
        </p>
      </header>
      <PublicationsList publications={publications} />
    </div>
  );
}
