import type { EducationRow, TimelineRow } from "@/types/content";
import { Reveal, RevealGroup } from "./Reveal";

type Props = {
  heading: string;
  rows: Array<TimelineRow | EducationRow>;
};

function isEducation(row: TimelineRow | EducationRow): row is EducationRow {
  return "dissertation" in row || "advisor" in row;
}

export function Timeline({ heading, rows }: Props) {
  return (
    <section>
      <h2 className="h2 mb-6 flex items-baseline gap-3">
        <span>{heading}</span>
        <span
          aria-hidden="true"
          className="font-mono text-xs"
          style={{ color: "var(--color-ink-4)" }}
        >
          [{String(rows.length).padStart(2, "0")}]
        </span>
      </h2>
      <ul
        className="relative space-y-4 border-l pl-5"
        style={{ borderColor: "var(--color-rule)" }}
      >
        <RevealGroup stagger={70}>
          {rows.map((row, i) => (
            <Reveal
              as="li"
              key={`${row.year}-${i}`}
              variant="fade"
              className="relative grid grid-cols-[6.25rem_1fr] items-start gap-4"
            >
              <span
                aria-hidden="true"
                className="timeline-dot absolute -left-[1.45rem] top-2 h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--color-accent)" }}
              />
              <span
                className="pt-px text-right font-mono text-xs"
                style={{
                  color: "var(--color-ink-3)",
                  fontFeatureSettings: '"tnum" on',
                }}
              >
                {row.year}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-[color:var(--color-ink)]">
                  {row.title}
                </p>
                <p className="small text-[color:var(--color-ink-2)]">{row.org}</p>
                {isEducation(row) && row.dissertation ? (
                  <p className="mt-1 small text-[color:var(--color-ink-3)]">
                    <span className="mono-label mr-1.5">Dissertation</span>
                    <span className="italic">{row.dissertation}</span>
                  </p>
                ) : null}
                {isEducation(row) && row.advisor ? (
                  <p className="small text-[color:var(--color-ink-3)]">
                    <span className="mono-label mr-1.5">Advisor</span>
                    {row.advisor}
                  </p>
                ) : null}
                {row.note ? (
                  <p className="mt-1 small italic text-[color:var(--color-ink-3)]">
                    {row.note}
                  </p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </RevealGroup>
      </ul>
    </section>
  );
}
