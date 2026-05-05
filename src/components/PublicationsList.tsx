"use client";

import { useMemo, useState } from "react";
import type { Publication } from "@/types/content";
import { PublicationItem } from "./PublicationItem";

type Props = {
  publications: Publication[];
};

export function PublicationsList({ publications }: Props) {
  const years = useMemo(
    () =>
      Array.from(new Set(publications.map((p) => p.year))).sort((a, b) => b - a),
    [publications],
  );

  const countByYear = useMemo(() => {
    const m = new Map<number, number>();
    for (const p of publications) m.set(p.year, (m.get(p.year) ?? 0) + 1);
    return m;
  }, [publications]);

  const [activeYear, setActiveYear] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      activeYear === null
        ? publications
        : publications.filter((p) => p.year === activeYear),
    [activeYear, publications],
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        <FilterChip
          active={activeYear === null}
          onClick={() => setActiveYear(null)}
        >
          all
          <span className="chip-count">{publications.length}</span>
        </FilterChip>
        {years.map((y) => (
          <FilterChip
            key={y}
            active={activeYear === y}
            onClick={() => setActiveYear(y)}
          >
            {y}
            <span className="chip-count">{countByYear.get(y)}</span>
          </FilterChip>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p
          role="status"
          aria-live="polite"
          className="border-t border-[color:var(--color-rule)] py-8 small text-[color:var(--color-ink-3)]"
        >
          No publications in {activeYear}.{" "}
          <button
            type="button"
            onClick={() => setActiveYear(null)}
            className="link-underline text-[color:var(--color-ink-2)]"
          >
            Show all
          </button>
          .
        </p>
      ) : (
        <ol
          key={activeYear ?? "all"}
          className="list-none border-t"
          style={{ borderColor: "var(--color-rule)" }}
        >
          {filtered.map((p) => (
            <li key={p.id}>
              <PublicationItem publication={p} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-active={active ? "true" : "false"}
      className="chip"
    >
      {children}
    </button>
  );
}
