# Pulse (one-tap reflex)

**File:** [`pulse.html`](pulse.html). Open it in any phone browser. There's nothing to install.

## How to play
- A coloured ring shrinks toward a white target ring.
- Tap **anywhere** on the screen when the two rings line up.
- A dead-centre tap is a **PERFECT**: it's worth +2, and chaining perfects builds a combo bonus. A near tap is **GOOD** (+1).
- Every hit makes the ring faster and the hit window tighter. If you tap early, or let it slip past, the game is over.

## What makes it addictive
- **Rounds of 5 to 30 seconds** with instant restart. "Play again" is the biggest button.
- **Near-miss feeling:** you can see exactly how close you were, so you want one more try.
- **Rising speed and colour shift:** tension builds without any new rules to learn.
- **Juice:** particles, screen shake on death, vibration on hits (Android; iPhone Safari ignores vibration).
- **Daily goal:** a score target that's the same for everyone today (15 to 34), plus a "goal streak" for hitting it on consecutive days.

## Come-back hook
Best score ever, today's best, the daily goal and the goal streak are all saved in `localStorage`.

## Monetisation placeholders
- A banner ad slot at the bottom, labelled. There is no ad network.
- 🏆 A prize pool screen showing a demo daily high-score leaderboard with $10 / $5 / $1. It's clearly marked DEMO, with no payment code.

## If picked, what comes next
1. Tune the difficulty curve from real playtests. Right now most runs end around 5 to 25.
2. Add a rewarded ad for "continue once", the standard monetisation for this genre. Add an interstitial ad every 3 to 4 deaths.
3. Add sound: a rising pitch with each combo is a big part of the pull for reflex games.
4. Add unlockable ring skins and colour themes as a progression sink.
5. A prize version needs server-side score validation (replays or input logs), because reflex scores are easy to fake.
