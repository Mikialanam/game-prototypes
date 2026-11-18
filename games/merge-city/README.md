# Merge a City (merge puzzle)

**File:** [`merge-city.html`](merge-city.html). Open it in any phone browser.

## How to play
- **Drag** a building onto a matching one to merge them into the next level up:
  House → Apartment → Tower → Skyscraper → Landmark. (You can also tap one, then tap its match.)
- Dragging onto an empty square just moves the building.
- A new house arrives every couple of seconds (the green bar), a little faster each time.
- If a house needs to arrive and the city is full, the round ends. The goal is the tallest building.
- Points for each merge (bigger buildings are worth much more). Best score and tallest building ever are saved on the device.

## Tunable constants (top of the `<script>`)
`GRID_SIZE`, `START_HOUSES`, `SPAWN_START`, `SPAWN_SPEEDUP`, `SPAWN_MIN`, the `BUILDINGS` ladder (names and points), `DRAG_THRESHOLD`, `SOUND_ON`.

## Feedback
Matching buildings glow while you drag; merges pop with a rising tone and "+points"; a banner and confetti for each new tallest building (a "First ever" banner the first time you build one).
