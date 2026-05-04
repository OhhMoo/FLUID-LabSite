"use client";

import { useEffect, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Stagger delay in ms applied via the --reveal-delay custom property. */
  delay?: number;
  /** Optional render-element override; defaults to a block-level div. */
  as?: "div" | "section" | "article" | "li" | "header" | "footer";
  className?: string;
  id?: string;
  /**
   * IntersectionObserver rootMargin — negative bottom value triggers slightly
   * after the element edge crosses the viewport, so the reveal feels intentional.
   */
  rootMargin?: string;
};

export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
  id,
  rootMargin = "0px 0px -10% 0px",
}: Props) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!node) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold: 0.05 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [node, rootMargin]);

  const cls = ["reveal", visible ? "is-visible" : "", className]
    .filter(Boolean)
    .join(" ");
  const style =
    delay > 0
      ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties)
      : undefined;

  const setRef = (el: HTMLElement | null) => setNode(el);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={setRef as any} id={id} className={cls} style={style}>
      {children}
    </Tag>
  );
}
