# Motion Recipes

Load at build time. Budget first, then copy-paste patterns. A page gets 2-3 intentional motions total; more reads as AI-generated.

## Budgets

| Kind | Duration | Notes |
|---|---|---|
| Feedback (hover, press) | 100-250ms | press state scale(0.97) |
| State change (toggle, tab) | 200-300ms | |
| Layout/entrance | 300-500ms | fade + 8-16px rise |
| Page-load orchestration | 500-800ms total | stagger 30-60ms across at most 7 items |

Exits run at about 75% of entrance duration with ease-in. Animate transform and opacity only. Never `transition: all`. Never animate width, height, top, left, or margin.

Approved easings:
- `cubic-bezier(0.25, 1, 0.5, 1)` (smooth out, default)
- `cubic-bezier(0.22, 1, 0.36, 1)` (settled)
- `cubic-bezier(0.16, 1, 0.3, 1)` (snappy)
Spring/overshoot `cubic-bezier(0.34, 1.56, 0.64, 1)` only when the direction row explicitly allows it.

## Recipe 1: page-load entrance (CSS only)

```css
@media (prefers-reduced-motion: no-preference) {
  .reveal { animation: rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .reveal:nth-child(2) { animation-delay: 40ms; }
  .reveal:nth-child(3) { animation-delay: 80ms; }
  @keyframes rise { from { opacity: 0; transform: translateY(12px); } }
}
```
Most important element first. Cap at 7 staggered children.

## Recipe 2: scroll reveal

Use on at most ONE element group per page; a fade-and-rise cascade on every section is one of the most cited AI tells, right next to the purple gradient. Prefer CSS scroll-driven animation, fall back to IntersectionObserver. Never bind to `scroll` events.

Content must be visible by default. Never ship a bare `opacity: 0` in a stylesheet waiting for an observer: with JS off, in a full-page capture, a link preview, or print, the page renders blank (both Claude and Codex baselines shipped exactly this bug in validation). The hide only applies after JS stamps `html.js`, and a timeout reveals anything the observer misses.

```css
@media (prefers-reduced-motion: no-preference) {
  html.js .scroll-reveal {
    animation: rise linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 60%;
  }
  @keyframes rise { from { opacity: 0; transform: translateY(12px); } }
  @supports not (animation-timeline: view()) {
    html.js .scroll-reveal {
      animation: none;
      opacity: 0;
      transform: translateY(12px);
      transition: opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
    }
    html.js .scroll-reveal.in { opacity: 1; transform: none; }
  }
}
@media print {
  html.js .scroll-reveal { animation: none; opacity: 1; transform: none; }
}
```

The JS below is required whenever the recipe is used; it stamps the guard class and reveals leftovers.

```js
document.documentElement.classList.add('js');
if (!CSS.supports('animation-timeline: view()')) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll('.scroll-reveal').forEach(el => io.observe(el));
  setTimeout(() => document.querySelectorAll('.scroll-reveal:not(.in)').forEach(el => el.classList.add('in')), 1500);
}
```

## Recipe 3: hover/press

```css
.btn { transition: transform 0.18s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.18s; }
.btn:hover { transform: translateY(-1px); background-color: var(--accent-hover); }
.btn:active { transform: scale(0.97); }
```

## Reduced motion

Wrap all motion in `@media (prefers-reduced-motion: no-preference)`, or provide:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

## Banned motion

`transition: all`; uniform hover scale-ups on everything; bounce/elastic easing outside a direction that specifies it; entrances from scale(0); animating layout properties; scattered micro-animations on every element; per-section scroll-reveal cascades; content hidden at `opacity: 0` without the `html.js` guard and reveal timeout (blanks the page for no-JS, previews, print); always-running ambient motion (everything gently dancing); animated focus rings; confetti; autoplaying motion that cannot be paused; choreographed load sequences inside product UI (dashboards get 120-180ms state changes only).
