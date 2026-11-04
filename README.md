# game-prototypes

Three tiny mobile game prototypes. Each one is a single self-contained HTML file: open it in a phone browser and play.

**Play on your phone:** https://mikialanam.github.io/game-prototypes/ (works once GitHub Pages is switched on, see the morning report).

| Game | Type | File | Notes |
|---|---|---|---|
| Glow Grid | Daily puzzle, streak | [games/glow-grid/glow-grid.html](games/glow-grid/glow-grid.html) | [README](games/glow-grid/README.md) |
| Pulse | One-tap reflex, high score | [games/pulse/pulse.html](games/pulse/pulse.html) | [README](games/pulse/README.md) |
| Math Sprint 60 | 60-second math sprint | [games/math-sprint/math-sprint.html](games/math-sprint/math-sprint.html) | [README](games/math-sprint/README.md) |

- Score them with the [rating sheet](RATING-SHEET.md).
- Morning reports are in [`reports/`](reports/). The history of every run is in [RUN-LOG.md](RUN-LOG.md).
- Smoke test (plays all three in headless Chromium): `node tools/smoke-test.js`

The ad slots and prize screens are **placeholders only**. There's no ad network, no payment code and no real money.
