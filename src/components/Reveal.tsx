"use client";

import { useEffect, useState, type ReactNode, type ElementType } from "react";

type Variant = "up" | "scale" | "fade";

type Props = {
  children: ReactNode;
  /** Stagger delay in ms applied via the --reveal-delay custom property. */
  delay?: number;
  /** Visual variant: vertical lift (up), gentle scale, or pure fade. */
  variant?: Variant;
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

type State = "ssr" | "hidden" | "visible";

export function Reveal({
  children,
  delay = 0,
  variant = "up",
  as = "div",
  className,
  id,
  rootMargin = "0px 0px -10% 0px",
}: Props) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  // SSR + first paint: render solid (state === "ssr"). After mount we decide
  // whether to hide-and-animate or leave alone.
  const [state, setState] = useState<State>("ssr");

  useEffect(() => {
    if (!node) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("visible");
      return;
    }

    const rect = node.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.95 && rect.bottom > 0;

    if (inView) {
      setState("visible");
      return;
    }

    setState("hidden");

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState("visible");
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

  // SSR: no .reveal class — element is fully visible on first paint.
  // Hidden: .reveal (opacity 0).
  // Visible: .reveal.is-visible (transitions to opacity 1).
  const revealClass =
    state === "ssr"
      ? ""
      : state === "visible"
        ? "reveal is-visible"
        : "reveal";

  const cls = [revealClass, className].filter(Boolean).join(" ") || undefined;

  const style =
    delay > 0 && state !== "ssr"
      ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties)
      : undefined;

  const Tag = as as ElementType;

  return (
    <Tag
      ref={(el: HTMLElement | null) => setNode(el)}
      id={id}
      data-variant={state === "ssr" ? undefined : variant}
      className={cls}
      style={style}
    >
      {children}
    </Tag>
  );
}
