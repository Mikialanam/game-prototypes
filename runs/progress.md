# Run progress

Run started 2026-11-18 21:10 UTC. Brief: **Train Switcher switch controls.** A young playtester liked the game but couldn't work out the arrows; he knows track switches from toy trains (pull a handle). Add a Settings screen (gear on the start screen and the pause menu) with "Switch controls": **Tap the rail** (default), **Lever**, **Arrow** (unchanged). All modes: animated switch movement, active branch highlighted, first-time hint on level 1, mode saved in localStorage.

Working branch: the GitHub Pages branch `claude/intelligent-lamport-sbfavc` directly (Miki asked for it). The session branch `claude/admiring-ramanujan-f60m4i` is fast-forwarded to match.

Stay on scope: only Train Switcher controls this run.

## Plan (this run)

| # | Step | Estimate | Status |
|---|---|---|---|
| 1 | Read progress, commits and the game; write this plan | 10 min | done |
| 2 | Settings screen: gear on start card and pause menu, three-mode picker, saved mode, "show hints again" | 25 min | done |
| 3 | Shared switch visuals: animated points that visibly swing, active branch glow; Tap-the-rail mode with big forgiving branch targets | 30 min | done |
| 4 | Lever mode: chunky lever beside each switch, placed clear of track and stations, tap or drag to flip, link rod to the points | 30 min | |
| 5 | First-time hints (pulsing hand + one-line caption) on level 1, per mode; first vehicle waits a moment | 20 min | |
| 6 | Smoke test `tools/smoke-train-controls.js` (all modes, phones, hints, saving); keep existing tests passing; check screenshots | 30 min | |
| 7 | README, home page text, RATING-SHEET / RUN-LOG note; final report | 15 min | |

## Later (not this run)
- Playtest the three modes with the same child and note which one he gets in the first minute.
- Maybe: tapping a station sets the whole route to it (one tap for the 4-station levels).

## Log
- 21:10 Read progress and commits. Pages branch is at 58f486b (difficulty + speed); no unfinished Train Switcher work.
- 21:25 Settings screen done: gear on the start card and the pause card (the header button's card, now titled "Paused" during play). Mode saved as `controls` in the existing save. Checked on iPhone SE. Next: rail mode and moving points.
- 21:40 Rail mode done: each branch owns a band 56px either side of its centre line (nearest wins; a station counts as part of its branch); the switch is a white piece of track that swings across in 0.3s; the set branch glows and the other is dimmed; a tapped branch flashes. Arrow mode keeps its arrow and buffer stops, and gains the glow and the slower visible turn. All 12 branch taps on level 4 land on the right switch. Next: lever mode.

---

# Previous run: City Hall Game

Run started 2026-11-18 06:13 UTC. Brief: **City Hall Game**: three phone prototypes of Faizan's political strategy game (Mayor's Desk, Contract Hustle with Miki's business-owner angle, Street Clash), to play before Faizan and Miki meet.

Working branch: `claude/laughing-cray-tbzkbv`, merged with the GitHub Pages branch `claude/intelligent-lamport-sbfavc` so the Pages branch can fast-forward to it. Each step is pushed to both.

Stay on scope: only the three City Hall games this run.

## Plan (this run)

| # | Step | Estimate | Status |
|---|---|---|---|
| 1 | Merge Pages branch; write this plan | 10 min | done |
| 2 | Mayor's Desk: 10 requests, budget, groups, dirty tricks, daily crisis, election; quick phone check; README | 30 min | done |
| 3 | Contract Hustle: 10 bid rounds, influence moves, computer mayor reacts to opinion; quick phone check; README | 30 min | done |
| 4 | Street Clash: pick protester or police, 60s levels, slapstick only, opinion meter; quick phone check; README | 30 min | done |
| 5 | Smoke test all three on emulated phones (`tools/smoke-city-hall.js`), check screenshots, fix layout | 30 min | done |
| 6 | Home page "New", RATING-SHEET.md rows, RUN-LOG.md note; final report | 20 min | done |

Shared rules for all three: made-up city (Port Halden) and parties, even-handed satire, single player, phone portrait, Public Opinion meter 0–100, ~5-minute term, daily crisis seeded by date, credits with buy/ad placeholders that never win outright, tunable constants, `SOUND_ON`, best score in localStorage.

## Later (not this run)
- More roles in the same city (protester leader, police chief, campaign funder) and multiplayer where each friend plays one part.
- Shared save between the three games (e.g. Contract Hustle's mayor is the one you played in Mayor's Desk).

## Log
- 06:13 Read progress and commits. Pages branch had City Builder etc.; merged into this branch (clean).
- 06:20 Mayor's Desk done and pushed to both branches. Bot check at 360x640 (12 terms per policy): fund-all wins 5/12, value bot 6/12, random 0/12. Fixed an exploit: reject-everything scored 100 from leftover credits, so credits now only count on a win. Toast moved off the meter.
- Note: another session pushed a Train Switcher change to the Pages branch at 06:17; merged it in. Always fetch and merge before pushing to Pages.
- 06:27 Contract Hustle done and pushed. First bot check showed passing every round beat bidding and fair/premium bids never won; retuned (cheaper builds, stronger connections weight, private jobs 12→5). Now: smart bidder 375, lobbyist 360 but risky (205–464, usually frozen out), always-pass 290. Odds text on bid buttons made readable.
- 06:35 Street Clash done and pushed. Bot runs at 360x640: protester bot clears level 1 with 4–8 people; police first counted any fast touch as a tackle, so even a careful bot sank opinion to 4. Now only running *into* someone tackles; a gentle bot ends level 1 at opinion 91. Recruit range up, boosts cheaper.
- 06:45 `tools/smoke-city-hall.js` added: plays all three games end to end on 320x568, 360x640, 390x844 and 412x915; checks buttons on screen and ≥44px, no sideways scroll, daily crisis, tricks, ad placeholder, frozen-out mayor, real finger drag, level 2, best scores saved, no console errors, and that a heavy-handed police bot ends with lower opinion than a gentle one (gentle ~65, rough 0–7). 428/428 pass. Screenshots checked at 320 and 360; only fix needed was a smaller header on 320px phones in Mayor's Desk.
- 06:50 Home page lists the three under "New · City Hall Game (Faizan × Miki)"; README table, RATING-SHEET.md rows plus meeting questions, RUN-LOG.md row. Pushed to Pages.

## Handover (City Hall run)
**Done:** Mayor's Desk, Contract Hustle, Street Clash, each with a README; `tools/smoke-city-hall.js` (428/428 on four phone sizes); home page, rating sheet, run log. All on `claude/laughing-cray-tbzkbv` and the Pages branch `claude/intelligent-lamport-sbfavc`.

**Blocked:** none.

**Choices Faizan and Miki may want to change (all are constants or plain lists at the top of each script):**
- Mayor's Desk: win line 50 opinion; leftover credits only count if you win (stops a reject-everything exploit); three rival rallies; tricks once each per term with 25–40% exposure risk.
- Contract Hustle: opinion of your firm (not of the mayor) is the meter; mayor shows one contract under 35, freezes you out under 20; score is company value with reputation ×2 and connections ×1.
- Street Clash: police tackles only count when you run *into* someone; escorts are the gentle path; being bonked as a protester raises opinion (sympathy); opinion multiplies score.
- Money: ads give small one-off credits; "Buy credits" does nothing on purpose.

**Next (later):** play-test numbers with real people (all balance is from bots); more roles in the same city; multiplayer; shared save across the three games.

---

# Previous run (2026-11-18 03:30 UTC)


Run started 2026-11-18 03:30 UTC (resuming the run of 2026-11-18 00:15 that hit the usage limit). Stop by 07:30 UTC (4-hour cap).

Working branch: `claude/awesome-sagan-qgefe9`, kept rebased on the GitHub Pages branch `claude/intelligent-lamport-sbfavc` so it can fast-forward onto it.

## What the previous run left (checked 03:30 UTC)

| Item | State | Evidence |
|---|---|---|
| Math Ring: faster adaptive ramp | **Finished, not committed.** Builder finished and both smoke tests pass; the review and fix passes never ran (usage limit). | Uncommitted `games/math-ring/*`, new `tools/smoke-math-ring.js` |
| Train Switcher: big arrows, tap zone, themes | **Half done, not committed.** Builder stopped mid-way (usage limit): `train-switcher.html` changed (+496/−134 lines), README not updated, new `tools/smoke-train-switcher.js` untested. | Uncommitted diff |
| City Builder spec | **Not written.** Two of three designs finished (puzzle-feel, landlord-economy); the third designer and the spec writer hit the limit. | Workflow journal (session scratch) |
| City Builder game | Not started. | |
| Branches | `main` gained `CLAUDE.md` (run rules). Pages branch `claude/intelligent-lamport-sbfavc` unchanged since 2026-11-11. Two research-report branches (`bold-einstein`, `vibrant-clarke`) unrelated. No Mayor's Desk / Contract Hustle / Street Clash commits anywhere yet. | `git ls-remote` |
| Open pull requests | None. | GitHub |

## Plan (this run)

| # | Step | Estimate | Status |
|---|---|---|---|
| 1 | Write this file; verify and commit Math Ring | 20 min | done |
| 2 | Train Switcher: finish arrows, tap zone, themes; smoke test on phones; review; commit | 30 min | done |
| 3 | City Builder spec from the two finished designs → `docs/city-builder-spec.md` | 25 min | done |
| 4 | City Builder v1, part 1: map, merging, renting, flags, settings screen | 30 min | done |
| 5 | City Builder v1, part 2: tenants, deals, jobs and skills, away | 30 min | done (written with part 1) |
| 6 | City Builder smoke test on phones (all-on, all-off, mixed flags); fix layout | 30 min | done |
| 7 | Home page "New", RATING-SHEET.md, RUN-LOG.md, README; final report | 20 min | done |

## Later (not this run)
- Second review pass on Math Ring (feel test with real players, especially children).
- City Builder: friends visiting each other's cities and trading deals (code is structured for it, not built).

## Log
- 03:30 Resumed. Math Ring smoke tests re-run: `smoke-test-2.js math-ring` and `smoke-math-ring.js` both pass, screenshots at 360x640 checked.
- ~03:40 Train Switcher committed. New `smoke-train-switcher.js` passes (68 checks, all three themes, 3 phone sizes). The old `smoke-test-2.js train-switcher` bot is flaky at level 4 on the *original* game too (its 40ms polling bot sometimes misroutes); it passed 2 of 2 runs on the new version. Screenshots at 360x640 checked for trains, boats and planes.
- ~03:42 City Builder spec written (`docs/city-builder-spec.md`), from the puzzle-first and landlord-economy designs; the map-first design and the synthesis never ran.
- 03:47 City Builder v1 written in one pass (all six systems, flags, hidden settings). First phone check at 360x640: merge, chain and auto move-in work, no console errors. Not yet smoke-tested across flag combinations.
- 03:52 City Builder smoke test `tools/smoke-city-builder.js` passes: 364 checks, 4 phone sizes, full all-on session, settings screen, and all 64 flag combinations grow without a dead end; no console errors. Fixes from it: a closing bottom sheet no longer swallows taps; long sheets scroll so buttons stay on small phones; the market won't open a deal when there's no room for the building.
- Home page lists City Builder first under "New"; README, RATING-SHEET.md (City Builder row plus a "which features make it fun" table) and RUN-LOG.md updated.

## Handover
**Done:** Math Ring faster ramp, Train Switcher big arrows + themes, City Builder spec and v1, all smoke-tested on emulated phones and pushed to `claude/awesome-sagan-qgefe9`.

**Blocked:** none. Published: Miki said "publish", so the Pages branch `claude/intelligent-lamport-sbfavc` was fast-forwarded to this work (78ebdea). All three games load on https://mikialanam.github.io/game-prototypes/.

**Left / next run:**
- Play-test City Builder numbers (all are paper estimates): houses every 3s may fill the map too fast for a casual player; pile labels on every house make the map busy.
- One feel review of Math Ring with real players (the reviewer passes from the first attempt never ran).
- `tools/smoke-test-2.js train-switcher`: its 40ms polling bot sometimes misroutes at level 4, on the old game too. Use `smoke-train-switcher.js` instead, or slow the old bot.
- City Builder friends' visits and trading: structure only.
- 06:17 Miki asked: Train Switcher `CRASH_ON_BUSY_FLIP` set to false for the kids (busy switch shakes, no crash). Tests updated to match (`smoke-train-switcher.js`: 68 checks pass; `smoke-test-2.js train-switcher` skips the forced crash when crashes are off). Published to Pages.
- 07:36 Miki asked: Train Switcher difficulty picker (Kid / Adult / Expert, own best level each; crash rule now part of difficulty, only Expert crashes) and a speed option (Slow / Normal / Fast, changes mid-level). `smoke-train-switcher.js` 72 checks pass; `smoke-test-2.js train-switcher` passes. Start card checked on iPhone SE and iPhone 13.
- 07:42 Fixed a flaky Train Switcher test: file:// pages share saved data across Playwright browsers, so parallel checks overwrote each other's best level. Each test browser now gets its own address. 3 runs in a row: 72/72. (The game itself was not affected.)
