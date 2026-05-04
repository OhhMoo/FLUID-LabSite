import Image from "next/image";
import { LinkedinIcon } from "./icons";
import type { Person } from "@/types/content";

type Props = {
  person: Person;
  /** Compact variant for alumni rows: drops the avatar slot. */
  compact?: boolean;
};

export function PersonCard({ person, compact = false }: Props) {
  const { name, role, classYear, linkedIn, photo } = person;
  return (
    <article className={compact ? "" : "flex items-start gap-4"}>
      {compact ? null : (
        <div
          className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[color:var(--color-rule)] bg-[color:var(--color-surface-2)]"
          aria-hidden={!photo}
        >
          {photo ? (
            <Image
              src={photo}
              alt={name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : null}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-tight text-[color:var(--color-ink)]">
          {name}
        </p>
        <p className="mt-1 small text-[color:var(--color-ink-2)]">{role}</p>
        {classYear ? (
          <p className="mt-1 font-mono text-xs text-[color:var(--color-ink-3)]">
            {classYear}
          </p>
        ) : null}
        {linkedIn ? (
          <a
            href={linkedIn}
            target="_blank"
            rel="noreferrer"
            aria-label={`${name} on LinkedIn`}
            className="mt-2 inline-flex items-center gap-1 small text-[color:var(--color-ink-3)] transition-colors hover:text-[color:var(--color-accent)]"
          >
            <LinkedinIcon size={14} />
            <span>LinkedIn</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
