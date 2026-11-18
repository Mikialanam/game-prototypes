# Train Switcher (routing puzzle, with themes)

**File:** [`train-switcher.html`](train-switcher.html). Open it in any phone browser.

## How to play
- Coloured trains (or boats, or planes) come in at the top. **Tap a big arrow** to flip which way it points; the arrow and the bright path show the way.
- Send every vehicle to the **station (dock, airport) of its own colour**.
- An arrow won't turn while a vehicle is on it (the button turns red and shakes). Wait for it to pass.
- A wrong station ends the level; tap **Try again**. Deliver every vehicle to clear it.
- Each level adds vehicles and speed (and more stations, up to 4). Best level cleared is saved on the device.

## Made for small fingers
- Switch buttons are about 90px across on a 390px phone (they shrink only if they would touch each other or a station).
- **Generous tap zone:** a tap up to `TAP_RADIUS` (100px) from a switch flips it, and the nearest switch wins. Every tap shows a ripple where it landed.
- **No crashes (default, for kids):** `CRASH_ON_BUSY_FLIP = false`, so a busy switch just shakes and stays put. Set it to `true` for the harder rule: tapping a switch under a vehicle crashes (the start card's wording changes to match).

## Themes
- **Trains, Boats, Planes**: pick on the start card, or any time with the button in the top-left corner (the game pauses while the picker is open). Also on the win and fail cards.
- Same game underneath: same levels, speeds, layouts and rules. Only the look and the words change (rails / water channel / sky route; station / dock / airport).
- The pick is saved on the device. Changing theme never resets your best level.

## Tunable constants (top of the `<script>`)
The `LEVELS` table, `EXTRA_TRAINS_PER_LEVEL`, `EXTRA_SPEED_PER_LEVEL`, `EXTRA_GAP_PER_LEVEL`, `MIN_GAP`, `SWITCH_ZONE`, `CAR_COUNT`, `CAR_SPACING`,
`SWITCH_SIZE` (share of screen width), `SWITCH_SIZE_MAX`, `SWITCH_GAP`, `ARROW_MIN_TILT`, `TAP_RADIUS`, `CRASH_ON_BUSY_FLIP`, `COLOURS`,
`DEFAULT_THEME`, the `THEMES` table (names, words, colours per theme), `SOUND_ON`.

## Tests
`node tools/smoke-train-switcher.js` plays all three themes on emulated phones (iPhone 13, iPhone SE, 360x640) and checks the tap zone, nearest-switch taps, saved theme, pause and both busy-switch rules (no crash by default, crash when switched on).
