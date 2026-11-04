# Glow Grid (daily puzzle)

**File:** [`glow-grid.html`](glow-grid.html). Open it in any phone browser. There's nothing to install.

## How to play
- You get a 5×5 grid of tiles. Some are lit.
- Tapping a tile flips it **and** its four neighbours (up, down, left, right).
- Switch every light off. Matching or beating **par** gets 3 stars.
- Everyone gets the same puzzle each day, and a new one unlocks at local midnight.
- After you solve the daily puzzle, you can play unlimited **Practice puzzles**. These don't affect your streak.

## What makes it addictive
- **Scarcity:** there's one real puzzle a day, so you can't binge it and get bored.
- **Streak (🔥):** missing a day resets it. Loss aversion keeps players coming back.
- **Par and stars:** after you solve it, you wonder whether you could have done it in fewer moves.
- **Shareable result:** "Copy result" puts a spoiler-free result on the clipboard (`Glow Grid #308 ★★★ 7 moves (par 7) · 🔥3`). This is the same viral loop that daily word games use.
- **Countdown:** "Next puzzle in 18:48:15" plants the return visit.

## Come-back hook
The daily puzzle, the streak, the best streak and the countdown are all saved in `localStorage`.

## Monetisation placeholders
- A banner ad slot at the bottom, labelled. There is no ad network.
- 🏆 A prize pool screen showing a demo $10 / $5 / $1 leaderboard for the fewest moves. It's clearly marked DEMO, with no payment code.

## If picked, what comes next
1. Hand-tune difficulty by weekday (easy Monday, hard Sunday), and verify the true minimum moves with a solver so "par" is exact.
2. Add a server for the daily seed plus a real leaderboard, so scores are comparable and can't be faked by changing the phone clock.
3. Add a rewarded ad for a "hint" or a "streak freeze". That's the most natural ad placement for this genre.
4. Add an archive of past puzzles (ad-supported or paid unlock).
5. Add variants to keep it fresh: 6×6 weekends, or tiles that flip diagonally.
