type Props = {
  n: number;
};

export function SectionNumber({ n }: Props) {
  return <span className="section-number">{String(n).padStart(2, "0")}</span>;
}
