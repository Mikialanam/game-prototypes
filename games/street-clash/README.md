# Street Clash (City Hall Game 3, the street side, from Faizan's idea)

**File:** [`street-clash.html`](street-clash.html). Open it in any phone browser. Levels last about 60 seconds and get faster and busier.

Same made-up city (Port Halden). A big march on City Hall. **Pick a side** at the start. Cartoon slapstick only: bonks, tackles, people spinning with stars over their heads and getting back up saying "I'm OK!". No blood, no weapons, nothing graphic. Signs say things like "MORE!", "LESS!", "WHY?" and "BUT ALSO", so the march isn't about any real cause.

## Controls
Drag anywhere on the street to move (your character runs to just above your finger). One big button at the bottom.

## ✊ Protester
- Run up a long street to the **rally point** before the 60 seconds run out.
- Touch the grey people with a **?** to rally them; they join your line. How many say yes depends on Public Opinion. People with a red bandana are rowdy: they join happily but sometimes smash a shop window (Opinion −3).
- **📣 Chant** (6s recharge): rallies everyone nearby and gives you a speed burst.
- Cops chase you when you get close. If one bonks you, you tumble and lose 2 people, but the public sympathises (Opinion +2).
- Orange **barriers** block the street with one gap. Push into one for half a second to knock it over: quicker, but Opinion −6 ("Vandals!").
- Level score = (people with you × 10 + seconds left × 2) × Opinion/50.

## 👮 Police
- Marchers walk down toward **City Hall**. If 8 reach the steps (a sit-in), you lose the level. Hold out for 60 seconds.
- **Stand in someone's way** (or touch them gently) to **escort** them off: slow but calm (Opinion +1).
- **Run into** someone to **tackle** them: fast, but tackling a peaceful marcher costs Opinion −3 ("Too hard!"). Tackling a rowdy one is fine (+1). Half of tackled peaceful marchers get back up and keep going.
- **🚨 Charge** (5s recharge): a fast dash that tackles everyone you touch. Opinion −2 just for charging, since it's on the news.
- Rowdy marchers sometimes smash a shop window, which turns the public your way (+2).
- If Opinion falls under 30, outrage brings more marchers.
- Level score = (cleared × 10 + empty steps × 5) × Opinion/50.

**On both sides:** Public Opinion carries over between levels. Hit zero and it's game over ("Lost the public"). Winning the fight isn't the same as winning the public: the opinion multiplier on your score means a brutal win scores less than a clean one.

**Today's crisis** changes one rule per day, picked from the date: rain (longer tumbles), heat wave (everyone slower), live TV crew (opinion swings ×1.5), marathon day (joggers knock people over), festival (more people).

**Between levels:** credits from your score buy one small boost for the next level only (protester: megaphone or running shoes; police: body cam that halves opinion losses, or a radio for a faster charge). "Watch an ad" (+15, once per run) and "Buy credits" are placeholders. Boosts are small and last one level, so paying can't win outright.

Best score is saved separately for each side.

## Tunable constants (top of the `<script>`)
Both sides: `LEVEL_TIME`, `START_OPINION`, `PLAYER_SPEED`, `NPC_RADIUS`, `TUMBLE_TIME`, `LEVEL_SPEEDUP`, `ROWDY_SHARE`, `BOOST_COST`, `AD_CREDITS`, `SOUND_ON`.
Protester: `STREET_LENGTH`, `STREET_GROWTH`, `COPS_BASE`, `BYSTANDERS_BASE`, `COP_SPEED`, `CHASE_RANGE`, `RECRUIT_RANGE`, `CHANT_RANGE`, `CHANT_COOLDOWN`, `BONK_LOSES`, `SYMPATHY_GAIN`, `SMASH_TIME`, `SMASH_HIT`, `ROWDY_SMASH_CHANCE`, `ROWDY_SMASH_HIT`.
Police: `MARCH_SPEED`, `SPAWN_EVERY`, `HALL_LIMIT`, `ESCORT_SPEED`, `ESCORT_TIME`, `TACKLE_CALM_HIT`, `TACKLE_ROWDY_GAIN`, `ESCORT_GAIN`, `CHARGE_HIT`, `CHARGE_COOLDOWN`, `ROWDY_SMASH_GAIN`, `OUTRAGE_OPINION`.
