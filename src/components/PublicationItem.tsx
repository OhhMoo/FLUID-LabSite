import type { Publication } from "@/types/content";

type Props = {
  publication: Publication;
};

export function PublicationItem({ publication }: Props) {
  const { authors, title, venue, year, volume, pages, doi, preprintUrl, pdfUrl } =
    publication;
  const doiUrl = `https://doi.org/${doi}`;
  return (
    <article className="border-b border-[color:var(--color-rule)] py-5 last:border-b-0">
      <p className="small text-[color:var(--color-ink-3)]">{authors}</p>
      <h3 className="mt-1 text-base font-medium leading-snug text-[color:var(--color-ink)]">
        <a href={doiUrl} target="_blank" rel="noreferrer" className="link-underline">
          {title}
        </a>
      </h3>
      <p className="mt-1 small text-[color:var(--color-ink-2)]">
        <em className="not-italic font-medium text-[color:var(--color-ink)]">
          {venue}
        </em>{" "}
        <span>
          {volume ? `${volume}, ` : ""}
          {pages ? `${pages} ` : ""}
          ({year})
        </span>
      </p>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        <a
          href={doiUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs uppercase tracking-wide text-[color:var(--color-ink-3)] transition-colors hover:text-[color:var(--color-accent)]"
        >
          DOI
        </a>
        {preprintUrl ? (
          <a
            href={preprintUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-wide text-[color:var(--color-ink-3)] transition-colors hover:text-[color:var(--color-accent)]"
          >
            preprint
          </a>
        ) : null}
        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-wide text-[color:var(--color-ink-3)] transition-colors hover:text-[color:var(--color-accent)]"
          >
            PDF
          </a>
        ) : null}
      </div>
    </article>
  );
}
