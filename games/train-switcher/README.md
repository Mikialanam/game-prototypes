# Train Switcher (routing puzzle, with themes)

**File:** [`train-switcher.html`](train-switcher.html). Open it in any phone browser.

## How to play
- Coloured trains (or boats, or planes) come in at the top. **Tap a big arrow** to flip which way it points; the arrow and the bright path show the way.
- Send every vehicle to the **station (dock, airport) of its own colour**.
- An arrow won't turn while a vehicle is on it (the button turns red and shakes). Wait for it to pass. On Expert, tapping it then is a **crash**.
- A wrong station ends the level; tap **Try again**. Deliver every vehicle to clear it.
- Each level adds vehicles and speed (and more stations, up to 4). Best level cleared is saved on the device.

## Made for small fingers
- Switch buttons are about 90px across on a 390px phone (they shrink only if they would touch each other or a station).
- **Generous tap zone:** a tap up to `TAP_RADIUS` (100px) from a switch flips it, and the nearest switch wins. Every tap shows a ripple where it landed.

## Difficulty and speed
Pick on the start card, or any time with the button in the top-left corner (it also changes the theme).
- **Who's playing?** 🧸 **Kid** (slowest, fewest vehicles, no crashes), 🙂 **Adult** (a bit slower than the original, no crashes), 🔥 **Expert** (faster than the original, and tapping a switch under a vehicle crashes). Same levels underneath. Each difficulty keeps its own best level (a best from before difficulties existed shows under Adult). Changing difficulty mid-level starts again at level 1.
- **Speed:** 🐢 Slow, ▶️ Normal, 🐇 Fast, on top of any difficulty. It changes straight away, even mid-level, and vehicles keep the same spacing.
- With no crashes, a switch with a vehicle on it just shakes and stays put.

## Themes
- **Trains, Boats, Planes**: pick on the start card, or any time with the button in the top-left corner (the game pauses while the picker is open). Also on the win and fail cards.
- Same game underneath: same levels, speeds, layouts and rules. Only the look and the words change (rails / water channel / sky route; station / dock / airport).
- The pick is saved on the device. Changing theme never resets your best level.

## Tunable constants (top of the `<script>`)
The `LEVELS` table, `EXTRA_TRAINS_PER_LEVEL`, `EXTRA_SPEED_PER_LEVEL`, `EXTRA_GAP_PER_LEVEL`, `MIN_GAP`, `SWITCH_ZONE`, `CAR_COUNT`, `CAR_SPACING`,
`SWITCH_SIZE` (share of screen width), `SWITCH_SIZE_MAX`, `SWITCH_GAP`, `ARROW_MIN_TILT`, `TAP_RADIUS`, `DIFFICULTIES` (speed, gap, vehicles and crash rule per difficulty), `DEFAULT_DIFFICULTY`, `MIN_TRAINS`, `SPEEDS`, `DEFAULT_SPEED`, `COLOURS`,
`DEFAULT_THEME`, the `THEMES` table (names, words, colours per theme), `SOUND_ON`.

## Tests
`node tools/smoke-train-switcher.js` plays all three themes on emulated phones (iPhone 13, iPhone SE, 360x640) and checks the tap zone, nearest-switch taps, saved theme, pause and both busy-switch rules (no crash by default, crash when switched on).
