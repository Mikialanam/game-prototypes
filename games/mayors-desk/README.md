# Mayor's Desk (City Hall Game 1, the mayor level)

**File:** [`mayors-desk.html`](mayors-desk.html). Open it in any phone browser. One term takes about 5 minutes.

Part of the City Hall Game: Faizan's political strategy idea, set in the made-up harbour city of **Port Halden**. All people, parties and places are invented. Both parties get the same satire.

## How to play
- Pick a party: **Harbour Alliance** ("Bold ideas, slightly over budget") or **Civic League** ("Common sense, eventually"). Your rival comes from the other one. The party only changes names and colours, not the rules.
- Ten city requests land on your desk one at a time (potholes, a bus route, a police budget, a protest permit, a developer's tower, a stadium, a council pay rise...). Each has a **cost in credits**, a **time in weeks**, and an effect on **Public Opinion** and four groups: 🏠 Residents, 💼 Business, 👮 Police, ✊ Activists.
- **Fund** it: pay now, get 40% of the opinion bump now and the rest when it's finished. If it finishes after week 48, voters never see it. (The tower *earns* credits but annoys residents and activists.)
- **Delay** it: free, comes back two cards later, the group asking gets impatient. Once per request.
- **Reject** it: free, the group asking gets angry.
- Happy groups pull opinion up each turn; unhappy ones drag it down. A group that gets nothing for 4 turns (or sooner if it's very angry) lashes out: a protest, a petition, a "slow week" or a bad headline (−6 opinion).
- Your rival holds three rallies (−3 each).
- **Today's crisis** arrives as the 5th card, with three ways to handle it. It's picked from the date, so everyone gets the same one each day.
- **Dirty tricks** (once each per term): spin the media (+6 now), delay the rival's permit (cancels two rallies), bribe an inspector (finish every project today). Each has a shown risk of being exposed 1–3 turns later, or on election eve, which costs 12–18 opinion.
- **Election:** you win if Public Opinion is at least 50. Score = vote share, plus credits left if you win (so hoarding can't beat governing). Best score is saved on the device.

## Credits and money placeholders
- "Watch an ad" gives +10 credits once per term (fake 2-second ad).
- "Buy credits" is a placeholder that does nothing. Note in the game: any real store should cap packs per term so money can't buy the election.

## Tunable constants (top of the `<script>`)
`START_CREDITS`, `START_OPINION`, `START_MOOD`, `WIN_OPINION`, `TERM_WEEKS`, `REQUESTS_PER_TERM`, `WEEKS_PER_TURN`, `CRISIS_AT`, `ANNOUNCE_SHARE`, `DRIFT_RATE`, `NEGLECT_LIMIT`, `ANGRY_MOOD`, `BACKLASH_HIT`, `DELAY_MOOD_HIT`, `RIVAL_RALLY_TURNS`, `RIVAL_RALLY_HIT`, `VOTE_SLOPE`, `AD_CREDITS`, `SOUND_ON`, and the `TRICKS` table (cost, risk, exposure hit). The 18 requests and 8 crises are plain lists in the script, easy to edit.

## Balance check (bots, 12 terms each)
Fund everything affordable: won 5 of 12. A simple "best value" bot: won 6 of 12. Random: won 0. Reject everything: never wins. Bots don't use tricks or the ad, so a thoughtful player should win a bit more than half the time.
