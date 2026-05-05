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
    <article
      className={
        "person-card " + (compact ? "" : "flex items-start gap-4")
      }
    >
      {compact ? null : (
        <div
          className="person-avatar relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border bg-[color:var(--color-surface-2)]"
          style={{
            borderColor: "var(--color-rule)",
            boxShadow:
              "0 0 0 1px var(--color-rule), 0 0 0 4px oklch(54% 0.215 262 / 0.04)",
          }}
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
          ) : (
            <span
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center text-sm font-medium"
              style={{
                color: "var(--color-ink-4)",
                letterSpacing: "-0.02em",
              }}
            >
              {name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </span>
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-tight text-[color:var(--color-ink)]">
          <span className="person-name">{name}</span>
        </p>
        <p className="mt-1 small text-[color:var(--color-ink-2)]">{role}</p>
        {classYear ? (
          <p
            className="mt-1 text-xs"
            style={{
              color: "var(--color-ink-3)",
              fontFamily: "var(--font-mono)",
              fontVariantNumeric: "tabular-nums lining-nums",
              letterSpacing: "-0.01em",
            }}
          >
            {classYear}
          </p>
        ) : null}
        {linkedIn ? (
          <a
            href={linkedIn}
            target="_blank"
            rel="noreferrer"
            aria-label={`${name} on LinkedIn`}
            className="mt-2 inline-flex items-center gap-1.5 small transition-colors hover:text-[color:var(--color-accent)]"
            style={{ color: "var(--color-ink-3)" }}
          >
            <LinkedinIcon size={13} />
            <span>linkedin</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
