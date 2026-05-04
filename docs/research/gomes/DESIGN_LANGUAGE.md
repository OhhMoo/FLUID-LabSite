# Gomes Group — Adopted Design Signals (Updated)

Source: https://gpggrp.cheme.cmu.edu/ (homepage) and /gabe (PI profile).

The Zhuang clone adopts the **full Gomes visual language** — dark theme,
card surfaces, monospace section headings — and reuses the /gabe PI-page
structure verbatim for the Zhuang PI section.

## Theme & color

- **Dark by default.** `<html class="dark">`. No light mode toggle.
- Body background: `rgb(0, 0, 0)` (true black) with a fixed `bg-zinc-900/95`
  + backdrop-blur layer behind cards.
- Body text: `rgb(189, 189, 189)` ≈ zinc-400 (paragraph copy).
- Card surface: `rgba(24, 24, 27, 0.9)` ≈ zinc-900/90 with `backdrop-blur(4px)`.
- Headings: `rgb(244, 244, 245)` ≈ zinc-100.
- Hairline rule: `rgb(63, 63, 70)` ≈ zinc-700.
- Date column accent (Affiliations / Awards): `rgb(96, 165, 250)` ≈ blue-400.
- Hover-only accent: `rgb(34, 211, 238)` ≈ cyan-400 (fall-back: blue-400).

## Typography

- Body: **Inter** (`var(--font-inter)`).
- Section headings & PI name: **SF Mono / JetBrains Mono** (`var(--font-jb-mono)`).
- Header bar logo text: same mono face.

Type scale (computed from /gabe + homepage):

| Token       | Size           | Weight | Family   | Use                           |
|-------------|----------------|--------|----------|--------------------------------|
| display-xl  | 60px / 1       | 400    | Inter    | homepage hero "the Zhuang group" |
| display     | 48px / 1.05    | 400    | Inter    | homepage hero subtitle         |
| section-h2  | 42px / 1.1     | 500    | mono     | "research", "team", etc.       |
| h1          | 36px / 1.1     | 700    | mono     | PI name                        |
| h2          | 24px / 1.25    | 700    | sans     | "Affiliations", "Awards"       |
| body        | 16px / 1.5     | 400    | sans     | prose                          |
| small       | 14px / 1.4     | 400    | sans     | sub-line in timeline rows      |
| mono-label  | 16–20px        | 500    | mono     | header brand                   |

Letter-spacing on the hero is `-1.5px` (display-xl) and `-1.2px` (display).

## Layout

- Header: `fixed top-0 h-16 z-40` mono bar with `bg-zinc-900/80 backdrop-blur`.
- Page top padding: `pt-16` to clear the fixed header.
- Section cards: full-width within `container mx-auto px-4` with `gap-8`
  between cards; cards use `rounded-xl shadow-md p-8`.
- /gabe PI card: `flex flex-col lg:flex-row gap-8`; right column is
  `lg:w-1/3` (aspect-square portrait, `rounded-xl`, `grayscale brightness-75
  hover:grayscale-0 hover:brightness-100 hover:scale-105`); left column is
  `lg:w-2/3` (`prose dark:prose-invert max-w-none`).
- Numbered section motif preserved: `0N` rendered in mono, blue-400, before
  each section title (matches the homepage pattern).

## Affiliations & Awards row

```
<ul class="space-y-4">
  <li class="flex items-start gap-4">
    <span class="text-blue-400 min-w-[4rem] text-right">YEAR</span>
    <div>
      <p class="font-medium text-zinc-100">{role}</p>
      <p class="text-sm text-zinc-400">{org}</p>
    </div>
  </li>
</ul>
```

Same template for both Affiliations and Awards. Awards may have an italic
third paragraph for an award description.

## Header bar

- `<a>` with `flex items-center gap-3` mono, text `gpggrp@cmu` (we render
  `zhuang@hmc` as the brand to mirror the convention).
- Logo: 32×32 group icon image to the left of the brand text.

## What we do NOT adopt from Gomes

- Photo-rich faculty grids — Zhuang has no member headshots.
- Three-axis publications filter — Zhuang only filters by year.
- The peer-hover blur effect on homepage cards — performance/JS-heavy and
  not load-bearing for the language.

## Card composition rule

A "section" on the Zhuang home now lives inside a card surface. The card is:

- `bg-zinc-900/90 backdrop-blur-sm rounded-xl shadow-md`
- `p-8` interior padding
- `transition hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)]` (subtle lift)
- The numbered token (`01`, `02`, …) sits inside the card, top-left.

Section divider hairlines (`<hr class="hairline">`) are removed — the card
gap (`gap-8`) is the visual divider.
