# City Builder: spec (v1)

Merge a City + Property Tycoon in one game. Merge buildings on a town map (the "Bejeweled, but you build a city" feel), then rent out what you build. Property into money is the core. Tenants, deals, and a light job-and-skills layer sit around it, and rent keeps earning while you're away.

Built from two of the three designs from the 2026-11-18 run (puzzle-first and landlord-economy; the map-first designer and the spec writer hit the usage limit). Where they disagreed, the simpler idea won.

File: `games/city-builder/city-builder.html`. One self-contained page, phone portrait first (360x640 up to 390x844), saves to the device.

## 1. Core loop (five lines)
1. Houses arrive on the map. Drag a building onto a matching one to build the next level up. Neighbours of the same level chain-merge.
2. Every building earns rent into a coin pile on its doorstep. Tap a pile to collect it.
3. Apartments and up need a tenant: fill fast (rent now, might be trouble) or check references (wait, but you know).
4. Spend coins on land (haggle for it), market buildings, school classes; sell to buyers who come knocking.
5. Close the page; rent piles up; come back to a pile to collect.

## 2. Screen (360x640; scales with width)
- **Top bar (44px):** coins (hold it 2s for hidden settings), income per minute, tallest building.
- **Message strip (24px):** one line of plain-word hints ("Drag a house onto a house!").
- **Map:** 5 columns x 6 rows = 30 lots, in three blocks of two rows with a road between blocks. Lot size = (width − 32) / 5 ≈ 65px at 360. Start: blocks 1-2 open (20 lots), block 3 is 10 fenced FOR SALE lots.
- **Main Street (bottom, ~84px):** five places drawn as small buildings: 🚏 Bus stop (tenants), 💼 Work, 🎓 School, 🏪 Market (deals), 🏛️ Town Hall (always on). A place whose feature is off is drawn as a tree and does nothing.
- **Bubbles:** tapping a thing opens a small bottom sheet that belongs to that thing (max ~200px tall, big 56px buttons). No list screens, no tabs.

## 3. Building ladder
| Lv | Building | Merge bonus | Rent per minute | Value |
|---|---|---|---|---|
| 1 | House | 0 | 6 | 30 |
| 2 | Apartment | 5 | 16 | 75 |
| 3 | Tower | 15 | 42 | 190 |
| 4 | Skyscraper | 40 | 110 | 470 |
| 5 | Landmark | 100 | 290 | 1,170 |
| 6 | Spire | 250 | 760 | 2,900 |
| 7 | Mega Tower | 600 | 2,000 | 7,300 |
| 8 | Sky City | 1,500 | 5,200 | 18,000 |

Rent grows about 2.6x per level, so merging two always beats keeping two.

## 4. Systems

**Merging (flag `merging`).** A house arrives every 3s on a random empty open lot. Drag onto a match = merge; onto an empty lot = move; onto a different building = swap. Tap one, then tap its match, also works. **Chain:** after a merge, if a touching lot (up/down/left/right) holds the same level, it slides in 250ms later and merges again (constant `CHAIN_REACTIONS`). **Streak:** merges within 2.5s of each other multiply the merge bonus x1..x5. Full map: no game over and nothing is wiped; up to 3 houses queue on the road and the map edge pulses red until you merge. Two Sky Cities merge into a 5,000 coin payout and free both lots.

**Renting (flag `renting`).** Rent accrues continuously into a pile on each building (1 coin, stack, sack). A pile holds 2 minutes of rent. Tap a building with a pile to collect it and every touching pile (a sweep). Merging collects both piles.

**Tenants (flag `tenants`, needs renting).** Houses are owner-occupied (always earning, no decisions). An Apartment or bigger with no tenant shows a TO LET sign and earns nothing. While there is a vacancy, an applicant arrives at the bus stop every 15s (max 2 waiting). Tap the bus stop: **Move in now** or **Check references (15s)**. After checking you see 1-3 stars and choose **Move in** or **Send away**. An applicant ignored for 10s moves in by themselves (fill fast is the default). They go to the best vacant building.
| Tenant | Odds | Effect |
|---|---|---|
| ★★★ Good | 40% | Rent +20%, never late |
| ★★ OK | 30% | Normal rent |
| ★ Trouble | 30% | Late rent (pile stops 20s of every 60s); damage about every 90s |
Damage: cracks and a 🔧 on the building, rent halved. Tap the building → **Repair** (10% of its value) or **Evict** (free; the building is empty again). Merging repairs for free and keeps the better tenant. Unchecked tenants show "?" until their first incident.

**Deals (flag `deals`).** Haggle sheet: the other side's face, 3 patience dots, the current price, and **Deal** / **Push 8%** / **Push 20%**. Each side has a hidden limit. A push inside the limit is accepted ("OK, fine"); outside it costs 1 dot (8%) or 2 dots (20%); at 0 dots they walk away. Within 5% of the limit they say "That's my limit." Where deals happen: tapping a FOR SALE lot (land: asks the sticker price, limit 70-90%); the 🏪 Market sometimes has a building for sale (one below your tallest, asks 130% of value, limit 85-105%); a buyer 🤝 appears on one of your buildings (offers 85% of value, limit 105-140%) and stays 40s. Off: land is bought at the sticker price with one Buy button; no market, no buyers. Land prices: 100, then x1.6 per lot.

**Jobs and skills (flag `jobs`).** Tap 💼 Work: a 20s shift runs while you keep playing, then a wage sack appears on Work; tap to collect (wage 25, +50% per Career level). Tap 🎓 School: pick one of four skills; a 20s class costs 40 x next level²; max level 5. Skills: **Landlord** +10% rent per level; **Handy** −20% repair cost per level; **Charm** +1 patience dot at levels 2 and 4 (only matters with deals on); **Career** +50% wage per level. Never required.

**Away (flag `away`).** When you come back after 30s or more, rent for the time away is added at 50% speed, up to 4 hours, straight into the piles (piles can overfill while away). A strip says "Away 2h 10m: 1,240 waiting. Tap a sack!"; tapping any sack collects all of them. Trouble tenants earn 30% less while away. Off: nothing earns while the page is closed.

**Town Hall (always on).** A small grant sack fills every 20s (holds 4). Worth 5 coins, or 5 + 20s of the city's base rent when renting is off. This is the floor that stops any combination of flags from getting stuck.

## 5. Flag matrix (all 64 combinations must play)
| Off | What replaces it | What disappears |
|---|---|---|
| merging | Tap an empty lot: **Build house** (25). Tap a building: **Upgrade** (half the next level's value). Start with 150 coins. | Arriving houses, road queue, chains, streak, match glow |
| renting | Merge bonuses, wages and a bigger Town Hall grant are the income. | Coin piles, income per minute, tenants (forced off), Landlord skill |
| tenants | Every building is let and pays base rent. | Bus stop, TO LET, stars, damage, repair, evict, Handy skill |
| deals | Land at sticker price (Buy button). | Market, buyers, haggle sheet, Charm skill |
| jobs | Skills stay at 0. | Work, School |
| away | Clock stops while closed. | Welcome-back strip and away sacks |

Guards: with merging off and no buildings, the first house is free. The last building can't be sold. All six off = build with coins from the grant, upgrade, buy land. Flags set in the hidden settings override the code's constants on that device; switching a feature back on restores its saved state.

## 6. Hidden settings
Open: **hold the coin counter for 2 seconds** (a ring fills), or open the page with `#settings` (or `?settings`) at the end of the address. Shows six big on/off switches, each with one "when off" line and a dot when it differs from the code; **Back to code defaults**; tester helpers: +1,000 coins, skip 1 hour (runs the real away path), send an applicant, send a buyer, reset city (tap twice). Also `?flags=110111` (order: merging, renting, tenants, deals, jobs, away) sets flags from a link.

## 7. First minute and five-minute arc (all on)
- 0s: map with 4 houses and 1 apartment. Hint: "Drag a house onto a house!" Matching houses glow while you drag.
- ~5s: first merge pops; a house arrives every 3s.
- ~10s: an apartment shows TO LET; the bus brings an applicant: first tenant choice.
- ~20s: first coins on a doorstep; tap to collect.
- ~45s: first FOR SALE lot affordable: first haggle.
- 1-3 min: Work and School, the first market seller (100s), a trouble tenant's first late rent or damage, the first buyer (150s).
- 5 min: tallest around Landmark; income about 300-500 a minute.

## 8. Code structure (multiplayer-ready, single player today)
1. Constants: `FEATURES` (six flags) and every balance number.
2. Pure rules: `newCity(owner)`, `step(city, dt, flags, rng)` used by the live loop, the away catch-up and tests.
3. One dispatcher: `dispatch(action)` with plain-data actions (`move`, `merge`, `collect`, `build`, `upgrade`, `tenantDecide`, `repair`, `evict`, `dealOffer`, `dealAccept`, `work`, `collectWage`, `study`, `collectGrant`, `buyLand`). A visitor's view allows none of them.
4. Deals are plain data `{ id, kind, item, from, to, ask, limit, patience, price }`; the bot answers through `counterparty.respond(deal, offer)`, the same call a friend's answer would come through later.
5. Storage adapter: `store.load(owner)` / `store.save(city)` (localStorage today).
6. Renderer: `render(city, { readOnly })` draws any city, so a read-only visit is possible later.
7. Input, bubbles, settings, boot.
8. Test hook `window.__cb`: `state`, `dispatch`, `flags` / `setFlags`, `advance(seconds)`, `leave(seconds)`, `give(coins)`, `centre(lot)`, `seed(n)`.

## 9. Out of scope for v1
Visiting friends and trading with them (structure only), cloud saves, an ending, sound settings beyond on/off, tutorials beyond one-line hints.

## Choices Miki may want to change
- **Houses need no tenants** (only apartments and up). Keeps the tenant decision to a few times a minute.
- **No game over**: a full map just jams. If it feels toothless, `JAM_FINE` could charge coins while jammed.
- **Chain reactions on** (`CHAIN_REACTIONS`). They can eat a building you were saving.
- **Ignored applicants move in after 10s** (`AUTO_MOVE_IN`, 0 = always wait).
- **Away earns at 50% for up to 4 hours** (`AWAY_RATE`, `AWAY_CAP_HOURS`).
- All numbers are paper estimates; tune after playing.
