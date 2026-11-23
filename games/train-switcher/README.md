# Train Switcher (routing puzzle, with four themes, vehicle types and three switch controls)

**File:** [`train-switcher.html`](train-switcher.html). Open it in any phone browser.

## How to play
- Coloured trains (or boats, planes or cars) come in at the top. **Move the switches** so each one reaches the **station (dock, airport) of its own colour**. How you move a switch depends on the control mode (below).
- The **active route** (the way a vehicle would go right now, from the entry to its station) **glows** and its station has a halo; the other branches are dimmed. Every switch visibly swings across when it moves, with a short "clack-clack".
- **Kid mode waits for you:** on 🧸 Kid, every vehicle **stops just before each switch and waits** for as long as it takes (no timer, nothing fails while it waits). The waiting switch **glows** with a warm pulsing light and a rippling ring, two big **pulsing arrows** appear beside it (the gold one is the way it's set now), with a soft ping and the caption "Which way? Tap an arrow". Tap an arrow and the switch swings that way and the vehicle moves on. The mode's own control works too, picking the side you tap: the track you want (Tap the rail), the left or right side of the lever (Lever), or the left or right side of the arrow button (Arrow). Vehicles behind queue up a train-length apart, and new ones only come in when the entry is clear. A wrong pick still goes to the wrong station. Adult and Expert don't wait.
- A switch won't move while a vehicle is on it (it turns grey and red and shakes). Wait for it to pass. On Expert, trying to move it then is a **crash**.
- A wrong station ends the level; tap **Try again**. Deliver every vehicle to clear it.
- **Level 1 is a gentle warm-up on every difficulty:** one switch, two stations, 3 vehicles, slow, far apart (`FIRST_LEVEL`).
- Each level adds vehicles and speed (and more stations, up to 4). Best level cleared is saved on the device.

## Switch controls (⚙️ Settings)
Settings also has **🔊 Sound on / 🔇 Sound off** (saved; off silences every sound, vibration stays) and **Show the first-time hint again**.

Open Settings with the ⚙️ gear on the start card, or during play tap the top-left button (it pauses the game) and then the ⚙️ gear. The choice is saved on the device and can be changed mid-level; the level carries on.
- 👆 **Tap the rail** (default): tap the piece of track you want the vehicle to take; the switch swings onto it. Each branch has a wide tap band (`RAIL_TAP_WIDTH`, 56px either side of the line), a station counts as part of its branch, and tapping the switch itself flips it. Tapping the branch it's already on gives a little "yes" pulse.
- 🕹️ **Lever**: a chunky lever beside each switch, joined to it by a dashed rod, like a toy train set. It **leans the way the track goes** and the lamp on that side of its base lights up. Tap it, or slide it towards the other side, to flip it. It's placed automatically in the clearest spot next to its switch on every screen size.
- ➡️ **Arrow**: the original control, unchanged: tap the big round arrow (anywhere within `TAP_RADIUS`; the nearest switch wins).

**First-time tutorial:** on level 1 one 👆 hand glides in, shows a single switch flip with the selected control (taps the track, pushes the lever, or taps the arrow; the switch really moves), then lifts away, all in about 3.5 seconds, with a one-line caption. The first vehicle waits until it's done, and it's set up so the demonstrated flip is the right one for that vehicle. If the player moves a switch during the demo, the hand stops. It shows again on level 1 until level 1 has been won once in that mode; Settings → **Show the first-time hint again** brings it back for a new player. Timings: `TUTORIAL`, `HINT_WAIT`.

## Made for small fingers (Arrow mode)
- Switch buttons are about 90px across on a 390px phone (they shrink only if they would touch each other or a station).
- **Generous tap zone:** a tap up to `TAP_RADIUS` (100px) from a switch flips it, and the nearest switch wins. Every tap shows a ripple where it landed.

## Difficulty and speed
Pick on the start card, or any time with the button in the top-left corner (it also changes the theme).
- **Who's playing?** 🧸 **Kid** (slowest, fewest vehicles, no crashes, and every vehicle waits at each switch until you pick a way), 🙂 **Adult** (a bit slower than the original, no crashes), 🔥 **Expert** (faster than the original, and tapping a switch under a vehicle crashes). Same levels underneath. Each difficulty keeps its own best level (a best from before difficulties existed shows under Adult). Changing difficulty mid-level starts again at level 1.
- **Speed:** 🐢 Slow, ▶️ Normal, 🐇 Fast, on top of any difficulty. It changes straight away, even mid-level, and vehicles keep the same spacing.
- With no crashes, a switch with a vehicle on it just shakes and stays put.

## Themes
- **Trains, Boats, Planes, Cars**: pick on the start card, or any time with the button in the top-left corner (the game pauses while the picker is open). Also on the win and fail cards.
- Same game underneath: same levels, speeds, layouts and rules. Only the look and the words change (rails / water channel / sky route / road; station / dock / airport / garage).
- **Cars** drive on grey roads with a dashed centre line to garages marked P. In Tap-the-rail and Lever modes the moving part of each junction is a big painted road arrow; in Arrow mode a closed road gets traffic cones. A crash is a "Bump!".

## Vehicle types
Under the theme picker (start card and the theme card) is **Which train / boat / plane / car?** with three types and 🎲 **Mix**:
- Trains: 🚂 **Steam** (the original, now puffing smoke), 🚄 **Bullet** (long sleek cars, pointed white nose), 🚃 **Freight** (diesel engine pulling wagons of logs and coal).
- Boats: 🚤 **Motor** boat (the original), ⛵ **Sail**ing boat, 🛳️ **Ferry**.
- Planes: ✈️ **Jet** (the original), 🛩️ **Prop**eller plane with a spinning propeller, 🚁 **Heli**copter with whirling blades.
- Cars: 🚗 **Car**, 🚌 **Bus**, 🚚 **Truck**.
- 🎲 **Mix**: each vehicle that comes in is a random one of the three.

Every type is the same size and speed, so only the look changes; the vehicle is always painted in its colour. The pick is saved separately for each theme (`types` in the save), and can be changed mid-level. Add or rename types in `VEHICLE_TYPES` (the drawing for each id is in the "vehicle types" section of the script).
- The pick is saved on the device. Changing theme never resets your best level.

## Tunable constants (top of the `<script>`)
The `LEVELS` table, `EXTRA_TRAINS_PER_LEVEL`, `EXTRA_SPEED_PER_LEVEL`, `EXTRA_GAP_PER_LEVEL`, `MIN_GAP`, `SWITCH_ZONE`, `CAR_COUNT`, `CAR_SPACING`,
`SWITCH_SIZE` (share of screen width), `SWITCH_SIZE_MAX`, `SWITCH_GAP`, `ARROW_MIN_TILT`, `TAP_RADIUS`, `DIFFICULTIES` (speed, gap, vehicles and crash rule per difficulty), `DEFAULT_DIFFICULTY`, `MIN_TRAINS`, `SPEEDS`, `DEFAULT_SPEED`, `COLOURS`,
`DEFAULT_THEME`, the `THEMES` table, `VEHICLE_TYPES`, `MIX_TYPE` (names, words, colours per theme), `CONTROLS` (labels, start-card wording and hint caption per mode), `DEFAULT_CONTROLS`, `SWITCH_MOVE_TIME`, `RAIL_TAP_WIDTH`, `HUB_TAP_R`, `POINTS_LEN`, `LEVER_SIZE`, `LEVER_TILT`, `LEVER_TAP_R`, `LEVER_DRAG`, `TUTORIAL`, `HINT_WAIT`, `FIRST_LEVEL`, `SOUND_ON`, and for Kid's waiting: `wait` in `DIFFICULTIES`, `WAIT_STOP`, `WAIT_NEAR`, `FOLLOW_GAP`, `WAIT_ARROW_R`, `WAIT_CAPTION`.

## Tests
`node tools/smoke-train-controls.js` checks the three switch-control modes on emulated phones: Settings (start and pause cards, saved choice, mid-level change), rail taps along and beside every branch, lever placement and tap/slide rules, the visible switch movement, the first-time tutorial, sound on/off, the easy first level, the active route, and a bot winning levels 1 and 2 with each mode's own taps.

`node tools/smoke-train-wait.js` checks Kid's waiting on emulated phones: the vehicle stops in front of the switch and stays put with no input (8s, and through a pause), the switch glows, the two arrows are big, on screen and clear of stations, switches and levers on every level shape, an arrow tap or each mode's own tap sets the way and lets it go, vehicles queue, a wrong pick still fails, Adult and Expert never wait, and a bot wins Kid levels in every mode.

`node tools/smoke-train-switcher.js` plays all four themes on emulated phones, checks every vehicle type and Mix (picker on the start card, saved per theme, the vehicles really drawn as that type) (iPhone 13, iPhone SE, 360x640) and checks the tap zone, nearest-switch taps, saved theme, pause and both busy-switch rules (no crash by default, crash when switched on).
