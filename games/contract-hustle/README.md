# Contract Hustle (City Hall Game 2, Miki's business-owner angle)

**File:** [`contract-hustle.html`](contract-hustle.html). Open it in any phone browser. A game is 10 rounds, about 5 minutes.

Same made-up city as Mayor's Desk (Port Halden). You run **Halden Build Co.**, a construction firm chasing city contracts and influence. The mayor (Mayor Dale Fenwick) is run by the computer.

## How to play
Each round has two steps:
1. **Make a move** (optional, one per round):
   - 🎗️ **Donate to the mayor's campaign** (20 credits): Connections +12, Opinion −3 because donations are public record.
   - 🛝 **Fund a community playground** (20 credits): Reputation +6, Opinion +8. Slow, honest, good press.
   - 🥂 **Lobby over a long lunch** (10 credits): Connections +15 straight away, but a 30% chance it leaks next round (Opinion −15, Reputation −8, Connections −10).
   - ⏭️ Skip.
2. **Bid** on one of two city contracts (roads, tram line, seawall, school roof, housing, a glass tower, stadium VIP boxes, a luxury car park...), or pass and take small private jobs (+5).
   - Three bid levels: **Lowball** (78% of the city's budget), **Fair** (90%), **Premium** (100%). Each button shows your odds and your profit.
   - The city scores each bid on price, reputation and connections, plus the mayor's bias (popular firms get a boost, unpopular ones a penalty), plus a bit of luck. Two rival firms bid too: Granite & Sons (old and respected) and Brightline Builders (well connected).
   - Winning: you pay the build cost now and get paid your bid when the job finishes (1–3 rounds). Lowball margins are thin, so the crew may cut corners: cracks are found on completion (Opinion −8, Reputation −6).
   - The public reacts to what you build: schools and housing are loved, towers and luxury car parks are hated.

**The mayor reacts to Public Opinion of your firm.** Under 35 you only see one contract per round. Under 20 you're frozen out of city work until you win the public back.

**Today's crisis** is one rule change for the whole game, picked from the date (steel shortage, election season, Save Our Skyline campaign, audit week, transit strike...).

**Score:** company value after 10 rounds = cash + half of any unpaid work + reputation × 2 + connections. Best is saved on the device.

## Credits and money placeholders
- "Watch an ad": +15 credits once per game (fake 2-second ad).
- "Buy credits": placeholder only, does nothing. Note in the game: bought credits should never count toward company value.

## Tunable constants (top of the `<script>`)
`ROUNDS`, `START_CASH`, `START_OPINION`, `START_REP`, `START_CONN`, `DIM_OPINION`, `FROZEN_OPINION`, `COST_SHARE`, `COST_WOBBLE`, `BID_LEVELS`, `PRICE_WEIGHT`, `REP_WEIGHT`, `CONN_WEIGHT`, `MAYOR_BIAS`, `SCORE_NOISE`, `CORNER_MARGIN`, `CORNER_RISK`, `CORNER_HIT`, `PRIVATE_JOB_PAY`, `AD_CREDITS`, `REP_VALUE`, `CONN_VALUE`, `SOUND_ON`, and the `MOVES` table. Contracts, rivals and crises are plain lists in the script.

## Balance check (bots, 10 games each, before the playground was cut from 25 to 20 credits)
Always pass: 290. Always lowball: 294 (opinion drifts down from cracks). Always fair: 319. Always premium: 240 (never wins without connections). "Best expected profit" bot that donates or funds playgrounds when needed: 375 (best 491). Lobby every round: 360 on average but anywhere from 205 to 464, and usually frozen out by the end.
