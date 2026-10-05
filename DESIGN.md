# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-10-05
- Primary product surface: `/`, a free goal-duration calculator for Money Marathon.
- Evidence reviewed: the user's attached 45-part product specification; the workspace was empty with no existing brand assets.

## Brand
- Personality: calm, trustworthy, practical, encouraging, lightweight.
- Trust signals: transparent assumptions, browser-only calculation, no signup.
- Avoid: trading-terminal visuals, promised returns, aggressive conversion prompts.

## Product goals
- Answer how long a savings goal will take within 30 seconds, then explain the Android app's value.
- Non-goals: accounts, backend, tracking SDKs, PWA, full app replication.
- Success signals: short input-to-result flow, useful comparison, configured Play Store conversion.

## Personas and jobs
- Korean mobile visitors from search, Threads, and communities.
- Understand a realistic savings timeline and compare an extra monthly 200,000 KRW.
- Context: one-handed smartphone use; financial inputs stay in the browser.

## Information architecture
- Navigation: brand, calculator anchor, app anchor.
- Route: `/` only, without a router.
- Hierarchy: hero → four-input form → result after submission → comparison → app → explanation → FAQ → disclaimer.

## Design principles
- Make the next action obvious; use 만원 inputs and plain Korean.
- Treat the calculator as the primary surface; don't fabricate an initial result.
- Use an understated route/finish-line motif to express progress.
- Tradeoff: richer desktop framing, identical short mobile flow.

## Visual language
- Color: deep navy #17332f, teal #236c5e, mint #dbece3, cream #f7f6f0.
- Typography: local system Korean sans serif, spacious headings, tabular numeric inputs; no external fonts.
- Rhythm: 8px scale, max 1120px content width, 24–40px section spacing.
- Shape: 16–24px cards, fine borders, restrained shadows; pill labels.
- Motion: only gentle result scrolling; respect reduced-motion preferences.
- Imagery: inline SVG route illustration and flag; no large hero bitmap.

## Components
- New: Header, MoneyInput, ResultCard, ComparisonCard, AppCTA, Disclaimer.
- States: idle, invalid, achieved, unreachable, copied/share failure, CTA unconfigured.
- Ownership: CSS tokens in src/styles/tokens.css; page composition in src/pages/BillionCalculator.tsx.

## Accessibility
- Target: WCAG 2.2 AA; semantic landmarks, one h1, labeled fields.
- Keyboard: visible focus, submit via Enter, focus results after successful calculation.
- Contrast: dark text on pale surfaces; errors use text and icon, not color alone.
- Screen readers: linked help/errors, polite announcements, result heading focus.
- Reduced motion: instant scroll when requested; decorative SVG hidden from assistive technology.

## Responsive behavior
- Validate 320, 360, 390, 430, 768, 1024, and 1440px widths.
- Desktop: two-column hero/form; mobile: compact hero then full-width form.
- Inputs and primary actions ≥48px tall; no hover-only functionality.

## Interaction states
- Loading: no artificial calculation delay.
- Empty: defaults in the form, no initial result.
- Error: finite bounded nonnegative inputs; goal >0; rates 0–100%.
- Success: months, calendar month, input snapshot, real +20만원 comparison.
- Disabled: CTA explains missing configuration and has no invented destination.
- Offline: already-loaded calculations work; no service worker.

## Content voice
- Friendly, concise Korean; use estimates rather than guaranteed outcomes.
- Units: inputs in 만원; display compact Korean amounts and years/months.
- A month applies return first and adds the contribution at month end.

## Implementation constraints
- Vite, React, TypeScript, plain CSS; no UI framework or runtime backend.
- Small inline SVG assets; static 1200×630 PNG social preview.
- No financial data in URLs, storage, network requests, or analytics.
- Domain Vitest coverage; Playwright responsive, accessibility, and privacy smoke checks.

## Open questions
- [x] Actual Google Play listing URL: owner-provided com.minigyunilab.moneymarathon in src/config.ts; optional VITE_PLAY_STORE_URL override.
- [ ] Production domain: assumed https://moneymarathon.pages.dev; update metadata, robots, and sitemap if different.
