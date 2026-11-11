# game-prototypes

Tiny mobile game prototypes. Each one is a single self-contained HTML file: open it in a phone browser and play.

**Play on your phone:** https://mikialanam.github.io/game-prototypes/ (works once GitHub Pages is switched on, see the morning report).

| Game | Type | File | Notes |
|---|---|---|---|
| Math Ring | Brain workout: math sprint + one ring save | [games/math-ring/math-ring.html](games/math-ring/math-ring.html) | [README](games/math-ring/README.md) |
| Tower Drop | Tap-to-stack, perfect-drop combos | [games/tower-drop/tower-drop.html](games/tower-drop/tower-drop.html) | [README](games/tower-drop/README.md) |
| Train Switcher | Routing puzzle, levels | [games/train-switcher/train-switcher.html](games/train-switcher/train-switcher.html) | [README](games/train-switcher/README.md) |
| Merge a City | Merge puzzle, tallest building | [games/merge-city/merge-city.html](games/merge-city/merge-city.html) | [README](games/merge-city/README.md) |
| Property Tycoon | Idle game, earnings while away | [games/property-tycoon/property-tycoon.html](games/property-tycoon/property-tycoon.html) | [README](games/property-tycoon/README.md) |
| Glow Grid | Daily puzzle, streak | [games/glow-grid/glow-grid.html](games/glow-grid/glow-grid.html) | [README](games/glow-grid/README.md) |
| Pulse | One-tap reflex, high score | [games/pulse/pulse.html](games/pulse/pulse.html) | [README](games/pulse/README.md) |
| Math Sprint 60 | 60-second math sprint | [games/math-sprint/math-sprint.html](games/math-sprint/math-sprint.html) | [README](games/math-sprint/README.md) |

- Score them with the [rating sheet](RATING-SHEET.md).
- Morning reports are in [`reports/`](reports/). The history of every run is in [RUN-LOG.md](RUN-LOG.md).
- Smoke tests (play the games in headless Chromium): `node tools/smoke-test.js` (first three), `node tools/smoke-test-2.js` (second batch)

The ad slots and prize screens are **placeholders only**. There's no ad network, no payment code and no real money.
