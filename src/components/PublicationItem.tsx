import type { Publication } from "@/types/content";

type Props = {
  publication: Publication;
};

export function PublicationItem({ publication }: Props) {
  const { authors, title, venue, year, volume, pages, doi, preprintUrl, pdfUrl } =
    publication;
  const doiUrl = `https://doi.org/${doi}`;
  return (
    <article className="pub-item">
      <p
        className="text-xs"
        style={{
          color: "var(--color-ink-3)",
          letterSpacing: "-0.005em",
        }}
      >
        {authors}
      </p>
      <h3 className="mt-1.5 text-base font-medium leading-snug text-[color:var(--color-ink)]">
        <a
          href={doiUrl}
          target="_blank"
          rel="noreferrer"
          className="pub-title"
        >
          {title}
        </a>
      </h3>
      <p className="mt-1.5 small text-[color:var(--color-ink-2)]">
        <span className="italic font-medium text-[color:var(--color-ink)]">
          {venue}
        </span>
        <span style={{ color: "var(--color-ink-3)" }}>
          {volume ? `, ${volume}` : ""}
          {pages ? `, ${pages}` : ""}{" "}
          ({year})
        </span>
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <a
          href={doiUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium tracking-[-0.005em] transition-colors hover:text-[color:var(--color-accent)]"
          style={{ color: "var(--color-ink-3)" }}
        >
          DOI <span aria-hidden="true">→</span>
        </a>
        {preprintUrl ? (
          <a
            href={preprintUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium tracking-[-0.005em] transition-colors hover:text-[color:var(--color-accent)]"
            style={{ color: "var(--color-ink-3)" }}
          >
            Preprint <span aria-hidden="true">→</span>
          </a>
        ) : null}
        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium tracking-[-0.005em] transition-colors hover:text-[color:var(--color-accent)]"
            style={{ color: "var(--color-ink-3)" }}
          >
            PDF <span aria-hidden="true">→</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
