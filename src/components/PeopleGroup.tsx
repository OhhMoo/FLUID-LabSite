import type { Person } from "@/types/content";
import { PersonCard } from "./PersonCard";

type Props = {
  title: string;
  people: Person[];
  /** Compact variant for alumni: drops avatars and tightens the grid. */
  compact?: boolean;
};

export function PeopleGroup({ title, people, compact = false }: Props) {
  if (people.length === 0) return null;
  return (
    <section className="border-t border-[color:var(--color-rule)] py-10 first:border-t-0 first:pt-0">
      <h3 className="mb-6 font-mono text-xs uppercase tracking-wide text-[color:var(--color-accent)]">
        {title}
      </h3>
      <div
        className={
          compact
            ? "grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3"
            : "grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {people.map((person) => (
          <PersonCard key={person.slug} person={person} compact={compact} />
        ))}
      </div>
    </section>
  );
}
