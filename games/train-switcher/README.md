# Train Switcher (routing puzzle)

**File:** [`train-switcher.html`](train-switcher.html). Open it in any phone browser.

## How to play
- Coloured trains enter at the top. **Tap a switch** (the white circles) to flip which way it points; the arrow and the bright rail show the way.
- Send every train to the **station of its own colour**.
- Don't flip a switch while a train is on it (the circle turns red). That's a **crash**.
- A wrong station or a crash ends the level; tap **Try again**. Deliver every train to clear it.
- Each level adds trains and speed (and more stations, up to 4). Best level cleared is saved on the device.

## Tunable constants (top of the `<script>`)
The `LEVELS` table (stations, trains, speed, gap between trains), `EXTRA_TRAINS_PER_LEVEL`, `EXTRA_SPEED_PER_LEVEL`, `EXTRA_GAP_PER_LEVEL`, `MIN_GAP`, `SWITCH_ZONE`, `CAR_COUNT`, `CAR_SPACING`, `TAP_RADIUS`, `COLOURS`, `SOUND_ON`.

## Feedback
Stations pulse with a ring and a rising tone on each delivery; trains shake and explode on a crash; confetti on level clear.
