# City Builder (merge puzzle + landlord)

**File:** [`city-builder.html`](city-builder.html). Open it in any phone browser. Spec: [`docs/city-builder-spec.md`](../../docs/city-builder-spec.md).

Merge a City and Property Tycoon in one game: merge buildings on a town map, then rent out what you build.

## How to play
- **Merge:** drag a building onto a matching one (or tap one, then its match) to build the next level: House → Apartment → Tower → Skyscraper → Landmark → Spire → Mega Tower → Sky City. A fresh merge also pulls in a touching building of the same level (**chain**), and quick merges build a **streak** (×2 to ×5 bonus). Drag onto an empty lot to move, onto a different building to swap.
- Houses arrive every 3 seconds. When the map is full they wait on the road (up to 3) and the map glows red. Nothing is ever wiped: merge to make room.
- **Rent:** every building fills a coin pile on its doorstep. Tap a pile to collect it and every pile touching it.
- **Tenants:** Apartments and up need a tenant (houses look after themselves). Tap the 🚏 bus stop: **Move in now** (rent starts now, might be trouble) or **Check references** (wait 15s, see 1-3 stars). Ignore them and they move in by themselves after 10s. Trouble tenants pay late and break things: tap the building to **Repair** or **Evict**. Merging repairs for free and keeps the better tenant.
- **Deals:** tap the FOR SALE land, the 🏪 market (when it shows !) or a building with a 🤝 buyer. Haggle with **Push 8%** or **Push 20%**: inside their hidden limit they agree; outside it they lose patience (the dots), and at zero they walk away.
- **Jobs and skills:** tap 💼 Work for a 20s shift, tap again to collect the wage. 🎓 School sells classes: Landlord (more rent), Handy (cheaper repairs), Charm (more patience in deals), Career (bigger wages).
- **Away:** rent keeps earning at half speed for up to 4 hours while the game is closed. Come back to full sacks; one tap collects them all.
- 🏛️ **Town Hall** pays a small grant every 20s, always, so no mix of switched-off features can leave you stuck.

## Feature switches
Every feature can be switched off. Any combination still plays (the test checks all 64).
- **In code:** the `FEATURES` block at the very top of the `<script>`: `merging`, `renting`, `tenants`, `deals`, `jobs`, `away`.
- **On your phone (hidden settings):** **press and hold the coin counter (top left) for 2 seconds**, or open the game with `#settings` at the end of the address. Switches, "Back to code defaults", and tester buttons (+1,000 coins, skip 1 hour away, send an applicant, a buyer or a market seller, reset city). Settings are saved on that phone only.
- **From a link:** `?flags=110111` sets all six in order (merging, renting, tenants, deals, jobs, away; 1 = on).

| Off | What happens instead |
|---|---|
| merging | Tap an empty lot to build a house (25), tap a building to upgrade it. |
| renting | Income is merge bonuses, wages and a bigger Town Hall grant. Tenants switch off too. |
| tenants | Every building is let and pays normal rent. |
| deals | Land at the sticker price, no market, no buyers. |
| jobs | No Work or School; skills stay at 0. |
| away | Nothing earns while the game is closed. |

## Tunable constants (top of the `<script>`)
The `BUILDINGS` ladder (rent per minute, merge bonus, value), start coins, `SPAWN_EVERY`, `QUEUE_MAX`, `CHAIN_REACTIONS`, `STREAK_WINDOW`, land prices, Town Hall grant, tenant odds and timings (`APPLICANT_EVERY`, `AUTO_MOVE_IN`, `CHECK_SECONDS`, late rent, damage, repair), haggling (`HAGGLE_DOTS`, push sizes, each side's limits), market and buyer timings, work and school, away (`AWAY_RATE`, `AWAY_CAP_HOURS`), `SOUND_ON`.

## Built for friends later
Single player today, but the city is plain data with an owner id, every change goes through one `dispatch()` of plain actions, the renderer can draw any city read-only (for visiting), deals are plain data answered through a `counterparty` interface (a friend could answer instead of the bot), and saving goes through a small storage adapter.

## Tests
`node tools/smoke-city-builder.js` (about 5 minutes; `QUICK=1` skips the layout and 64-combination passes).
