import Link from "next/link";
import type { Thrust } from "@/types/content";

type Props = {
  thrust: Thrust;
  index: number;
};

export function ThrustCard({ thrust, index }: Props) {
  return (
    <article className="border-t border-[color:var(--color-rule)] py-6 first:border-t-0 first:pt-0">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm text-[color:var(--color-accent)]">
          R-{String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="h3">
          <Link href={`/research#${thrust.slug}`} className="link-underline">
            {thrust.title}
          </Link>
        </h3>
      </div>
      <p className="mt-2 max-w-prose text-[color:var(--color-ink-2)]">
        {thrust.summary}
      </p>
    </article>
  );
}
