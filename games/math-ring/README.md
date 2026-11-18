# Math Ring (math sprint + one ring save)

**File:** [`math-ring.html`](math-ring.html). Open it in any phone browser. There's nothing to install.

**Pitch:** a quick workout for your brain.

## How to play
- One maths question at a time. Tap one of the four big answers.
- A clock runs the whole time. A right answer adds **+2s**; a wrong one takes **−3s** (and flashes the right answer so you learn it).
- Questions get harder as you show you can handle them: addition → subtraction → times tables → division → bigger numbers. **Fast right answers climb quickly**, slow right answers climb at the old pace, and a wrong answer steps back a little. See "How the difficulty ramp works" below.
- When the clock hits zero you get **one** go at the ring (the Pulse reflex game): tap when the shrinking ring lines up with the white target ring. A hit adds **+10s** and the run carries on.
- Miss the ring and you're offered **"Watch an ad to extend"**: a 5-second **Ad placeholder** screen, then **+10s**. One per run.
- Decline, or run out of both saves, and the run is over. Score = right answers. Best score is saved on the device.

## How the difficulty ramp works
Each run keeps a hidden **rating** that starts at 0. The level on screen is the whole-number part of the rating, plus 1 (rating 3.4 = Level 4). There are 9 levels.

| The answer was… | Rating change | Constant |
|---|---|---|
| right and **fast** for that level | +0.6 | `RAMP_FAST` |
| right, 3 or more fast ones in a row | +0.6 **+0.3** | `STREAK_FOR_BONUS`, `STREAK_BONUS` |
| right at normal speed | +0.35 | `RAMP_OK` |
| right but **slow** | +0.25 (the old pace: a level every 4 right answers) | `RAMP_SLOW` |
| wrong | −0.75, and the streak ends | `WRONG_DROP` |

- **"Fast" depends on the level.** Every row of `LEVELS` has its own `fast` and `slow` seconds, because a fair fast time for `7 + 5` (2.5 s) is not a fair fast time for `347 − 189` (4.5 s). At or under `fast` = fast; over `slow` = slow; in between = normal.
- **Answer time** runs from the moment the question appears to the tap. The ring, the ad and the half-second pause after a mistake are never counted, because each of them ends with a fresh question.
- **The streak** counts fast right answers in a row. A normal, slow or wrong answer sets it back to 0.
- **Top level cushion:** at the top level the rating can keep rising by up to `TOP_CUSHION` (1), so one slip there doesn't drop a level straight away.
- **A new run always starts at Level 1.**

What the player sees:
- The level tag under the clock always shows the current level.
- Beside it: **⚡ Fast!** after a fast answer, **🔥 Fast ×3** (and counting) once the streak bonus is on.
- **Level up!** floats up in gold and the level tag flashes gold.
- When a wrong answer drops a level, the tag turns soft blue and says **↓ a bit easier**.
- The game-over card shows the highest level reached and the average time per answer.

What to expect (2,000 pretend players each, from `node tools/smoke-math-ring.js`):

| Player | Answers to reach Level 9 | Before this change |
|---|---|---|
| Strong: always right, 1-2 s | 10 | 32 |
| Steady: always right, 3-5 s | 22 (19 to 23) | 32 |
| Slow: always right, 8-12 s | 32 (31 to 32) | 32 |
| Mixed: 70% right, 3-6 s | Stays low: about Level 2 after 12 answers, Level 2-3 after 25, Level 3 after 40 | climbed a level every 4 right answers and never came down |
| Learner: 95% right up to Level 3, 55% above | Settles around Level 4 | same as above |

### Optional: points for harder questions
`SCORE_BY_DIFFICULTY` is `false` by default, so score = right answers and old best scores still mean the same thing. Set it to `true` and a right answer is worth **1 point on Levels 1-3, 2 on Levels 4-6 and 3 on Levels 7-9** (a gold "+2" or "+3" floats up beside the score, and the label under the score says "points"). That mode saves its best score separately (`bestByLevel` instead of `best`), so the two never mix.

## Tunable constants (top of the `<script>`)
- Clock and saves: `START_TIME`, `MAX_TIME`, `CORRECT_BONUS`, `WRONG_PENALTY`, `RING_EXTENSION`, `AD_EXTENSION`, `AD_SECONDS`, `WRONG_PAUSE_MS`.
- Difficulty ramp: `RAMP_FAST`, `RAMP_OK`, `RAMP_SLOW`, `STREAK_FOR_BONUS`, `STREAK_BONUS`, `WRONG_DROP`, `TOP_CUSHION`, and the `LEVELS` table (one row per level: which sums, how big the numbers are, and that level's `fast` and `slow` seconds).
- Scoring: `SCORE_BY_DIFFICULTY`.
- Ring: `RING_DELAY`, `RING_SPEED`, `RING_WINDOW`, `RING_START`, `RING_TARGET`.

Quick recipes:
- Ramp even faster: raise `RAMP_FAST` or `STREAK_BONUS`, or lower `STREAK_FOR_BONUS`.
- Kinder to mistakes: lower `WRONG_DROP` (at 0.75, a player at normal speed stops climbing once they get about 1 in 3 wrong).
- Make "fast" easier to earn on one level: raise that row's `fast` seconds.
- Keep `RAMP_SLOW` at 0.25 or more, or a careful player climbs slower than before.

## Tests
- `node tools/smoke-test-2.js math-ring`: the original play-through (clock, ring, ad, game over, best score).
- `node tools/smoke-math-ring.js`: the difficulty ramp on an emulated iPhone 13 and a 360×640 phone (fast bot, steady bot, wrong answers, real taps, ring/ad/game-over, layout), a layout check on three more sizes, the points mode, and the player table above. Set `SHOT_DIR` to choose where the screenshots go.
- Test hook: `window.__mathRing` has `phase`, `time` (read and write), `ans`, `ringR`, `ringTarget`, `ringWindow` as before, plus read-only `level` (counts from 0, so the screen shows `level + 1`), `topLevel`, `rating`, `streak`, `peak`, `score` and `lastSecs`. `answerIn(seconds, correct)` answers the question on screen as if it took that long, and `rate(rating, streak, seconds, correct)` is the ramp rule on its own for simulations.

## Notes
- The ring ignores taps for its first second, so a late tap on an answer button can't waste the one attempt.
- The ad is a placeholder only: no ad network, no tracking.
- Win animation: confetti on a ring hit and on a new best score.
