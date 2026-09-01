# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project layout

The Next.js app lives in `my-app/`, not the repository root. **Run all commands from `my-app/`.**

## Commands

```bash
cd my-app
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run start    # run the production build
npm run lint     # ESLint (eslint-config-next: core-web-vitals + typescript)
npx tsc --noEmit # type-check (no dedicated package.json script)
```

There is no test suite configured in this repo (no test script, no Jest/Vitest/Playwright config) — don't assume one exists.

## Architecture

This is a **single-page site**: `app/page.tsx` is the entire app (~700+ lines), rendered as one route. There are no other pages under `app/` besides `layout.tsx` and `globals.css`. Sections (`#top`, `#timeline`, `#projects`, `#personal`, `#contact`) are anchor-linked within that one component, not separate routes.

### Styling

Styling is hand-written CSS in `app/globals.css` (1000+ lines), using plain custom classes — **not** Tailwind utility classes. Tailwind and shadcn/ui scaffolding are installed and configured (`components.json`, `lib/utils.ts`'s `cn()` helper, `class-variance-authority`/`clsx`/`tailwind-merge` in `package.json`, `@tailwindcss/postcss` in `postcss.config.mjs`) but are not actually wired up in `globals.css` (no `@import "tailwindcss"` / `@tailwind` directives) and `cn()` is not imported anywhere. Treat them as unused scaffolding, not the project's styling convention.

Two Google Fonts are loaded in `app/layout.tsx` via `next/font/google` and exposed as CSS variables: `--font-quicksand` (headings/UI, weight 700) and `--font-vt323` (monospace/terminal look, e.g. the Projects section's terminal-styled cards).

### Components

`components/*.jsx` (`PillNav`, `FaultyTerminal`, `TextType`, `DecryptedText`, `Cubes`) are untyped JS files with no props types of their own; `page.tsx` wraps each with a hand-written prop interface and a `ComponentType<Props>` cast at the top of the file before using it. Newer components should be `.tsx` with their own exported prop types instead (see `ScrollReveal.tsx` for the pattern this repo has settled on).

Imports are relative (`../components/Foo`). The `@/*` path alias in `tsconfig.json` is configured but not used anywhere in the code — don't introduce it inconsistently.

`Cubes.jsx` is not imported anywhere in `app/` (dead component). `lenis`, `three`, `lucide-react`, and `react-router-dom` are in `package.json` but not imported anywhere in `app/` or `components/` either — installed but unused; don't assume they're part of the live architecture.

`gsap` (via `TextType`, `PillNav`, `Cubes`) and `motion` (`motion/react`, via `DecryptedText`) are the animation libraries actually in use.

### Scroll-driven animation architecture

Most of `page.tsx` is imperative, scroll-position-driven animation rather than React state/re-render. The established pattern: one `scroll` listener per concern, throttled to one update per `requestAnimationFrame`, reading `window.scrollY` / `getBoundingClientRect()` and writing directly to `ref.current.style.transform` or `style.setProperty('--custom-var', ...)` rather than triggering re-renders. Follow this pattern for new scroll effects rather than introducing per-frame `setState`.

Known perf pitfalls already fixed once in this codebase — avoid reintroducing them:
- Don't read layout (`getBoundingClientRect()`) immediately after writing a style in the same tick; it forces a synchronous reflow. Batch writes after reads, or defer reads to the next frame.
- Non-passive `wheel`/`touchmove`/`keydown` listeners block the browser's fast-path scrolling for as long as they're attached. Attach them only for the window of time they're actually needed and remove them after, not for the page's whole lifetime.
- If a prop toggles a WebGL/canvas render loop's pause state, read it from a ref inside the render loop rather than putting it in a `useEffect` dependency array — otherwise toggling it tears down and rebuilds the whole GL context.

Major moving pieces in `page.tsx`, in scroll order:
- **Hero**: name/about-me text parallax and fade, driven by a `--scroll-progress` CSS var.
- **`.parallax-veil`**: darkens the hero→timeline transition. Its opacity is capped at `0.70` — it is *never* fully opaque, so don't gate "is anything covered" logic on it reaching progress `1`.
- **`#timeline`**: a `position: sticky`-pinned section where vertical scroll drives horizontal `translateX` of a track of milestone cards (a scroll-multiplier constant controls how much vertical scroll one unit of horizontal travel costs). Includes a "now playing" widget beside the active card whose album art is fetched live and unauthenticated from Spotify's public oEmbed endpoint (`https://open.spotify.com/oembed?url=...`) for real `open.spotify.com` track links (falls back to a placeholder icon otherwise — no API key involved). Also includes a one-shot intro text overlay (`IntersectionObserver`/scroll-position-triggered, fires once per session) that temporarily locks scroll via non-passive listeners so it can't be scroll-skipped.
- **`#projects`**: cards styled like a Windows terminal (VT323 font, status dot, blinking cursor).
- **`#personal`**: renders `components/ScrollReveal.tsx`, a separate, reusable, self-contained scroll-driven "sticky panel reveal" — one pinned container spans the combined scroll range of all items, each panel is a `clip-path` polygon (built from real pixel coordinates, not percentages) that only translates vertically, and text is revealed via a second `clip-path` built from the same point array so it can never drift out of sync with the color panel. Respects `prefers-reduced-motion` via an entirely separate static, non-animated render branch (not just a CSS override). Exposes an `onOpaqueChange(opaque: boolean)` callback (read via ref internally, so an unmemoized caller-supplied function won't cause the effect to reattach) so a parent can know precisely when a fully opaque panel is covering the viewport — `page.tsx` uses this to pause `FaultyTerminal`'s WebGL background only when something opaque is actually covering it, not merely tinted by the veil.

`components/FaultyTerminal.jsx` is an OGL/WebGL shader background (an animated "terminal" grid, mouse-reactive). It's expensive to render continuously, so it's only paused when genuinely necessary (see above) — when paused, its render loop skips the draw call entirely rather than just freezing a time uniform.

### Data placeholders

Content arrays in `page.tsx` (`PROJECTS`, the timeline `timelineEntries`, each entry's `song.href`) mix real data with `"#"` placeholders depending on what's been filled in so far — check the current state in the file rather than assuming everything is real or everything is a placeholder.
