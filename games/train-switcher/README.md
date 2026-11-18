# Train Switcher (routing puzzle, with themes and three switch controls)

**File:** [`train-switcher.html`](train-switcher.html). Open it in any phone browser.

## How to play
- Coloured trains (or boats, or planes) come in at the top. **Move the switches** so each one reaches the **station (dock, airport) of its own colour**. How you move a switch depends on the control mode (below).
- The track a switch is set to **glows**; the other branch is dimmed. Every switch visibly swings across when it moves.
- A switch won't move while a vehicle is on it (it turns grey and red and shakes). Wait for it to pass. On Expert, trying to move it then is a **crash**.
- A wrong station ends the level; tap **Try again**. Deliver every vehicle to clear it.
- Each level adds vehicles and speed (and more stations, up to 4). Best level cleared is saved on the device.

## Switch controls (⚙️ Settings)
Open Settings with the ⚙️ gear on the start card, or during play tap the top-left button (it pauses the game) and then the ⚙️ gear. The choice is saved on the device and can be changed mid-level; the level carries on.
- 👆 **Tap the rail** (default): tap the piece of track you want the vehicle to take; the switch swings onto it. Each branch has a wide tap band (`RAIL_TAP_WIDTH`, 56px either side of the line), a station counts as part of its branch, and tapping the switch itself flips it. Tapping the branch it's already on gives a little "yes" pulse.
- 🕹️ **Lever**: a chunky lever beside each switch, joined to it by a dashed rod, like a toy train set. It **leans the way the track goes** and the lamp on that side of its base lights up. Tap it, or slide it towards the other side, to flip it. It's placed automatically in the clearest spot next to its switch on every screen size.
- ➡️ **Arrow**: the original control, unchanged: tap the big round arrow (anywhere within `TAP_RADIUS`; the nearest switch wins).

**First-time hint:** on level 1 a pulsing 👆 shows the move for the selected mode (on the branch to tap, pushing the lever, or on the arrow) with a one-line caption. The first vehicle waits a moment and the first switch starts the wrong way for it, so the hinted move is the right one. Once a switch has been moved, that mode's hint is remembered as seen. To show it again for a new player: Settings → **Show the first-time hint again**.

## Made for small fingers (Arrow mode)
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
`DEFAULT_THEME`, the `THEMES` table (names, words, colours per theme), `CONTROLS` (labels, start-card wording and hint caption per mode), `DEFAULT_CONTROLS`, `SWITCH_MOVE_TIME`, `RAIL_TAP_WIDTH`, `HUB_TAP_R`, `POINTS_LEN`, `LEVER_SIZE`, `LEVER_TILT`, `LEVER_TAP_R`, `LEVER_DRAG`, `HINT_WAIT`, `SOUND_ON`.

## Tests
`node tools/smoke-train-controls.js` checks the three switch-control modes on emulated phones: Settings (start and pause cards, saved choice, mid-level change), rail taps along and beside every branch, lever placement and tap/slide rules, the visible switch movement, the first-time hints, and a bot winning levels 1 and 2 with each mode's own taps.

`node tools/smoke-train-switcher.js` plays all three themes on emulated phones (iPhone 13, iPhone SE, 360x640) and checks the tap zone, nearest-switch taps, saved theme, pause and both busy-switch rules (no crash by default, crash when switched on).
