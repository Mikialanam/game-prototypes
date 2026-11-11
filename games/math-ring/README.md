# Math Ring (math sprint + one ring save)

**File:** [`math-ring.html`](math-ring.html). Open it in any phone browser. There's nothing to install.

**Pitch:** a quick workout for your brain.

## How to play
- One maths question at a time. Tap one of the four big answers.
- A clock runs the whole time. A right answer adds **+2s**; a wrong one takes **−3s** (and flashes the right answer so you learn it).
- Questions get harder every 4 right answers: addition → subtraction → times tables → division → bigger numbers.
- When the clock hits zero you get **one** go at the ring (the Pulse reflex game): tap when the shrinking ring lines up with the white target ring. A hit adds **+10s** and the run carries on.
- Miss the ring and you're offered **"Watch an ad to extend"**: a 5-second **Ad placeholder** screen, then **+10s**. One per run.
- Decline, or run out of both saves, and the run is over. Score = right answers. Best score is saved on the device.

## Tunable constants (top of the `<script>`)
`START_TIME`, `MAX_TIME`, `CORRECT_BONUS`, `WRONG_PENALTY`, `RING_EXTENSION`, `AD_EXTENSION`, `AD_SECONDS`, `LEVEL_EVERY`, the `LEVELS` difficulty table, and the ring's `RING_DELAY`, `RING_SPEED`, `RING_WINDOW`, `RING_START`, `RING_TARGET`.

## Notes
- The ring ignores taps for its first second, so a late tap on an answer button can't waste the one attempt.
- The ad is a placeholder only: no ad network, no tracking.
- Win animation: confetti on a ring hit and on a new best score.
