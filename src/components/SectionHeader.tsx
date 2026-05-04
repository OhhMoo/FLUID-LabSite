import { SectionNumber } from "./SectionNumber";

type Props = {
  n: number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  id?: string;
};

export function SectionHeader({ n, title, subtitle, id }: Props) {
  return (
    <header id={id} className="mb-8 scroll-mt-20">
      <div className="mb-3">
        <SectionNumber n={n} />
      </div>
      <h2 className="section-h2">{title}</h2>
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-[color:var(--color-ink-2)]">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
