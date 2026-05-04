import type { TimelineRow } from "@/types/content";

type Props = {
  heading: string;
  rows: TimelineRow[];
};

export function Timeline({ heading, rows }: Props) {
  return (
    <section>
      <h2 className="h2 mb-6">{heading}</h2>
      <ul className="space-y-4">
        {rows.map((row, i) => (
          <li key={`${row.year}-${i}`} className="flex items-start gap-4">
            <span className="min-w-[5rem] text-right font-mono text-sm text-[color:var(--color-accent)] sm:min-w-[6rem]">
              {row.year}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[color:var(--color-ink)]">
                {row.title}
              </p>
              <p className="small text-[color:var(--color-ink-2)]">
                {row.org}
              </p>
              {row.note ? (
                <p className="mt-1 small italic text-[color:var(--color-ink-3)]">
                  {row.note}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
