import type { Metadata } from "next";
import { publications } from "@/data/publications";
import { PublicationsList } from "@/components/PublicationsList";
import { SectionNumber } from "@/components/SectionNumber";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "publications-fluid",
  description: "Complete list of publications from the Zhuang group, 2010–2025.",
};

export default function PublicationsPage() {
  return (
    <div className="container-wide py-8">
      <Reveal as="article" className="surface-card p-6 sm:p-8">
        <header className="mb-10">
          <SectionNumber n={3} />
          <h1 className="section-h2 mt-3">publications</h1>
          <p className="mt-4 small text-[color:var(--color-ink-3)]">
            {publications.length} papers · {publications[publications.length - 1].year}–
            {publications[0].year}
          </p>
        </header>
        <PublicationsList publications={publications} />
      </Reveal>
    </div>
  );
}
