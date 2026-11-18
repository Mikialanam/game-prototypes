# Property Tycoon (idle)

**File:** [`property-tycoon.html`](property-tycoon.html). Open it in any phone browser.

## How to play
- You start with 🪙 50: **Buy** the Studio flat. Each property pays **rent automatically** every few seconds (the gold bar).
- Spend rent on the next property (it unlocks one at a time) or **Upgrade** what you own for more rent.
- Levels 10, 25 and 50 double that property's rent.
- Close the page and come back: a **Welcome back** screen shows what your properties earned while you were away (up to 8 hours).
- Progress, and lifetime earnings (the "best score"), are saved on the device. "Reset progress" at the bottom starts over.

## Tunable constants (top of the `<script>`)
`START_MONEY`, the `PROPERTIES` table (price, rent, cycle seconds), `UPGRADE_COST_MULT`, `UPGRADE_COST_GROWTH`, `RENT_PER_LEVEL`, `MILESTONES`, `OFFLINE_RATE`, `OFFLINE_CAP_HOURS`, `OFFLINE_MIN_SECONDS`, `SAVE_EVERY_SECONDS`, `SOUND_ON`.

## Feedback
"+rent" pops on each payout, banner and confetti for every new property and rent-doubling milestone, a coin shower when you collect away earnings.
