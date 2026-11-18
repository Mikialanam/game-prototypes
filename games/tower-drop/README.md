# Tower Drop (stacking)

**File:** [`tower-drop.html`](tower-drop.html). Open it in any phone browser.

## How to play
- A block swings across the top of the screen. **Tap** anywhere to drop it onto the tower.
- Any part that hangs over the edge is **cut off** and falls away, so the next block is smaller.
- Land within a few pixels of perfect and it snaps into place: **PERFECT**. Chain perfects for a combo; from 3 in a row the block grows back a little each time.
- Miss the tower completely and it's over. Score = floors built. Best is saved on the device.

## Tunable constants (top of the `<script>`)
`START_WIDTH`, `BLOCK_HEIGHT`, `SWING_SPEED`, `SPEED_UP`, `MAX_SPEED`, `PERFECT_TOLERANCE`, `COMBO_REGROW_AT`, `REGROW_PX`, `DROP_GRAVITY`, `HOVER_GAP`, `TOWER_SCREEN_Y`, `SOUND_ON`.

## Feedback
Falling cut-off pieces, gold sparks and a rising tone on perfects, screen shake on a miss, confetti on a new best.
