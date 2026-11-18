// Math Ring: checks the adaptive difficulty ramp, the real tap path, the ring / ad / game-over flow and the phone layout,
// then prints a JSON summary (with a simulation table of three kinds of player). Exits with code 1 if anything fails.
// Run: node tools/smoke-math-ring.js        (needs Playwright + Chromium)
// Screenshots go to the folder in SHOT_DIR (default: the OS temp dir), named mathring-<phone>-<what>.png.
const { chromium, devices } = require('playwright');
const fs = require('fs'), os = require('os'), path = require('path');
const GAME = path.join(__dirname, '..', 'games', 'math-ring', 'math-ring.html');
const SHOT = path.resolve(process.env.SHOT_DIR || os.tmpdir()) + path.sep;

// Phones that get the full play-through, and smaller / other sizes that only get a layout check.
const PHONES = {
  'iphone13': { ...devices['iPhone 13'], deviceScaleFactor: 1 },
  '360x640': { viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 },
};
const LAYOUT_ONLY = {
  '390x844': { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 },
  '375x667': { viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 },
  'iphoneSE-320x568': { ...devices['iPhone SE'], deviceScaleFactor: 1 },
};
const FAST_BOT_SECS = 1.5;                    // the fast accurate bot: every answer right, in 1.5 s
const STEADY_BOT_SECS = [3.2, 4.1, 4.9, 3.7]; // the slow accurate bot: every answer right, in 3-5 s
const FAST_BOT_MAX = 12, STEADY_BOT_MAX = 26; // answers each bot is allowed before it must be on the top level
const OLD_LEVEL_EVERY = 4;                    // the old ramp (a level every 4 right answers): the new one must never be slower

(async () => {
  const browser = await chromium.launch();
  const fails = [], out = { phones: {}, layoutOnly: {} };

  async function open(dev, file = GAME) {
    const ctx = await browser.newContext(dev);
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await page.goto('file://' + file);
    return { ctx, page, errs };
  }

  // Helpers bound to one page.
  function kit(page, name) {
    const G = expr => page.evaluate(expr);
    const check = (ok, msg) => { if (!ok) fails.push(`[${name}] ${msg}`); return ok; };
    const shot = what => page.screenshot({ path: `${SHOT}mathring-${name}-${what}.png` });
    const state = () => G(`({ phase: __mathRing.phase, time: __mathRing.time, level: __mathRing.level, top: __mathRing.topLevel, rating: __mathRing.rating,
      streak: __mathRing.streak, peak: __mathRing.peak, score: __mathRing.score, lastSecs: __mathRing.lastSecs,
      levelText: document.getElementById('levelNum').textContent, streakText: document.getElementById('streakTag').textContent })`);
    // Tap one of the four real answer buttons, like a finger would.
    const tapAnswer = async correct => {
      const ans = await G('__mathRing.ans');
      const vals = await page.$$eval('.ans', bs => bs.map(b => +b.textContent));
      const idx = correct ? vals.indexOf(ans) : vals.findIndex(v => v !== ans);
      if (idx < 0) throw new Error(`right answer ${ans} is not on a button: ${vals}`);
      await page.locator('.ans').nth(idx).tap();
    };
    // The level tag must always show the level the game is really on.
    const tagOk = async where => { const s = await state(); check(s.levelText === 'Level ' + (s.level + 1), `${where}: level tag says "${s.levelText}" but the level is ${s.level + 1}`); return s; };
    // Nothing wider than the screen, the four answers on screen and big enough to tap.
    const layout = async where => {
      const m = await G(`(() => { const box = e => { const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
        return { vw: innerWidth, vh: innerHeight, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight,
          ans: [...document.querySelectorAll('.ans')].map(box), tag: box(document.getElementById('levelTag')), q: box(document.getElementById('q')) }; })()`);
      check(m.sw <= m.vw, `${where}: page is wider than the screen (${m.sw} > ${m.vw})`);
      check(m.sh <= m.vh, `${where}: page is taller than the screen (${m.sh} > ${m.vh})`);
      check(m.ans.length === 4 && m.ans.every(a => a.w >= 48 && a.h >= 48), `${where}: an answer button is smaller than 48px`);
      check(m.ans.every(a => a.l >= 0 && a.t >= 0 && a.r <= m.vw + 0.5 && a.b <= m.vh + 0.5), `${where}: an answer button is off the screen`);
      check(m.tag.l >= 0 && m.tag.r <= m.vw + 0.5 && m.tag.b <= m.q.t + 0.5, `${where}: the level tag is clipped or overlaps the question`);
      return { screen: `${m.vw}x${m.vh}`, answerButton: `${Math.round(m.ans[0].w)}x${Math.round(m.ans[0].h)}`, questionBox: `${Math.round(m.q.w)}x${Math.round(m.q.h)}` };
    };
    const cardFits = async (sel, where) => {
      const m = await G(`(() => { const b = document.querySelector('${sel}').getBoundingClientRect(); return { t: b.top, b: b.bottom, l: b.left, r: b.right, vw: innerWidth, vh: innerHeight, sw: document.documentElement.scrollWidth }; })()`);
      check(m.t >= 0 && m.b <= m.vh + 0.5 && m.l >= 0 && m.r <= m.vw + 0.5 && m.sw <= m.vw, `${where}: the card does not fit on the screen`);
    };
    // Run the clock out and go through: ring hit -> ad offer -> ad -> game over. Returns what was seen on the way.
    const ringAdOver = async () => {
      const seen = {};
      const vp = page.viewportSize(), cx = vp.width / 2, cy = vp.height * 0.6;
      await G('__mathRing.time = 0.05');
      await page.waitForFunction(() => __mathRing.phase === 'ring', null, { timeout: 3000 });
      await page.touchscreen.tap(cx, cy);                    // a tap in the "get ready" second must be ignored
      check(await G('__mathRing.phase') === 'ring', 'ring: an instant tap used up the ring');
      await page.waitForFunction(() => Math.abs(__mathRing.ringR - __mathRing.ringTarget) < __mathRing.ringWindow * 0.8, null, { polling: 'raf', timeout: 6000 });
      await page.touchscreen.tap(cx, cy);
      await page.waitForTimeout(250); await shot('ring');
      await page.waitForFunction(() => __mathRing.phase === 'quiz', null, { timeout: 4000 });
      seen.timeAfterRing = +(await G('__mathRing.time')).toFixed(1);
      check(seen.timeAfterRing > 8 && seen.timeAfterRing <= 10, `ring: expected about +10s on the clock, got ${seen.timeAfterRing}`);
      await tapAnswer(true);                                  // a quick tap right after the ring: the ring's seconds must not count as answer time
      let s = await tagOk('after ring');
      seen.answerSecsAfterRing = +s.lastSecs.toFixed(2);
      check(s.lastSecs < 1.5, `ring: answer time after the ring was ${s.lastSecs.toFixed(2)}s, so the ring's time was counted`);
      await G('__mathRing.time = 0.05');
      await page.waitForSelector('#offerOv.show', { timeout: 3000 });
      await cardFits('#offerOv .card', 'ad offer');
      await page.tap('#adBtn');
      await page.waitForSelector('#adOv.show', { timeout: 2000 });
      await page.waitForFunction(() => __mathRing.phase === 'quiz', null, { timeout: 9000 });
      seen.timeAfterAd = +(await G('__mathRing.time')).toFixed(1);
      check(seen.timeAfterAd > 8 && seen.timeAfterAd <= 10, `ad: expected about +10s on the clock, got ${seen.timeAfterAd}`);
      await tapAnswer(true);
      s = await tagOk('after ad');
      seen.answerSecsAfterAd = +s.lastSecs.toFixed(2);
      check(s.lastSecs < 1.5, `ad: answer time after the ad was ${s.lastSecs.toFixed(2)}s, so the ad's time was counted`);
      const end = await state();
      await G('__mathRing.time = 0.05');
      await page.waitForSelector('#overOv.show', { timeout: 3000 });
      await page.waitForTimeout(700);
      seen.over = await G(`({ score: document.getElementById('oScore').textContent, best: document.getElementById('oBest').textContent, accuracy: document.getElementById('oAcc').textContent,
        levelReached: document.getElementById('oLevel').textContent, perAnswer: document.getElementById('oAvg').textContent, savesUsed: document.getElementById('oSaves').textContent })`);
      check(await G('__mathRing.phase') === 'over', 'game over: phase is not "over"');
      check(seen.over.score === String(end.score), `game over: score shows ${seen.over.score}, expected ${end.score}`);
      check(seen.over.levelReached === String(end.peak + 1), `game over: level reached shows ${seen.over.levelReached}, expected the peak ${end.peak + 1}`);
      check(/^\d+\.\ds$/.test(seen.over.perAnswer), `game over: "per answer" shows "${seen.over.perAnswer}"`);
      check(seen.over.savesUsed === '2', `game over: saves used shows ${seen.over.savesUsed}, expected 2`);
      await cardFits('#overOv .card', 'game over');
      await shot('over');
      return seen;
    };
    return { G, check, shot, state, tapAnswer, tagOk, layout, cardFits, ringAdOver };
  }

  // ---------- full play-through on each phone ----------
  for (const [name, dev] of Object.entries(PHONES)) {
    const { ctx, page, errs } = await open(dev);
    const { G, check, shot, state, tapAnswer, tagOk, layout, cardFits, ringAdOver } = kit(page, name);
    const r = out.phones[name] = {};
    const constants = await G(`(() => { const a = __mathRing.rate(2, 0, 0, true), b = __mathRing.rate(2, 0, 1e9, true), c = __mathRing.rate(2, 0, 1, false);
      return { top: __mathRing.topLevel, fastGain: a.rating - 2, slowGain: b.rating - 2, wrongDrop: 2 - c.rating }; })()`);

    // --- start screen ---
    await cardFits('#startOv .card', 'start');
    await shot('start');

    // --- run 1: the real tap path ---
    await page.tap('#startBtn');
    let s = await tagOk('first question');
    check(s.phase === 'quiz' && s.level === 0 && s.rating === 0 && s.streak === 0 && s.streakText === '', 'a new run should start on level 1 with no streak');
    r.layout = await layout('quiz');
    const realTaps = [];
    for (let i = 1; i <= 3; i++) {
      const before = await state();
      await tapAnswer(true);
      s = await tagOk(`real tap ${i}`);
      realTaps.push(+s.lastSecs.toFixed(2));
      check(s.score === before.score + 1, `real tap ${i}: score should go up by 1`);
      check(s.rating > before.rating && s.streak === i, `real tap ${i}: a quick right answer should raise the rating and the streak (rating ${before.rating} -> ${s.rating}, streak ${s.streak})`);
      check(s.lastSecs >= 0 && s.lastSecs < 2, `real tap ${i}: measured answer time ${s.lastSecs.toFixed(2)}s looks wrong`);
    }
    check(s.streakText.includes('🔥') && s.streakText.includes('3'), `after 3 fast answers the streak tag should show the flame and 3, got "${s.streakText}"`);
    await page.waitForTimeout(450);
    await shot('streak');
    await page.waitForTimeout(750);                    // by now this question has been on screen for about 1.2 s
    await tapAnswer(true);
    s = await tagOk('timed real tap');
    r.realTapSecs = { quick: realTaps, afterWaiting1200ms: +s.lastSecs.toFixed(2) };
    check(s.lastSecs > 1.0 && s.lastSecs < 3, `a tap after waiting 1.2 s was measured as ${s.lastSecs.toFixed(2)}s`);
    // a real wrong tap
    let before = await state();
    await tapAnswer(false);
    s = await tagOk('real wrong tap');
    check(s.rating < before.rating && s.streak === 0, `a wrong tap should lower the rating and end the streak (rating ${before.rating} -> ${s.rating}, streak ${s.streak})`);
    check(s.score === before.score, 'a wrong tap should not change the score');
    check(s.time < before.time - 2.5, `a wrong tap should take about 3s off the clock (${before.time.toFixed(1)} -> ${s.time.toFixed(1)})`);
    check(await page.locator('.ans.right').count() === 1 && await page.locator('.ans.wrong').count() === 1, 'a wrong tap should show the right answer');
    check(await G('__mathRing.answerIn(1)') === false, 'answers should be locked while the right answer is shown');
    r.realWrongTap = { ratingBefore: before.rating, ratingAfter: s.rating, streakAfter: s.streak };
    await page.waitForTimeout(650);

    // --- run 2: fast accurate bot ---
    await page.reload();
    await page.tap('#startBtn');
    const fast = { levels: [], reachedTopAfter: null };
    let levelUpShot = false;
    for (let i = 1; i <= FAST_BOT_MAX; i++) {
      before = await state();
      check(await G(`__mathRing.answerIn(${FAST_BOT_SECS})`) === true, `fast bot: answer ${i} was refused`);
      s = await tagOk(`fast bot answer ${i}`);
      fast.levels.push(s.level + 1);
      if (s.level > before.level) {
        check(await page.locator('.float', { hasText: 'Level up!' }).count() >= 1, `fast bot: no "Level up!" float on answer ${i}`);
        if (!levelUpShot && i >= 3) { await shot('levelup'); levelUpShot = true; }
      }
      if (s.level === s.top && !fast.reachedTopAfter) fast.reachedTopAfter = i;
    }
    check(fast.reachedTopAfter !== null, `fast bot did not reach the top level in ${FAST_BOT_MAX} answers (levels: ${fast.levels})`);
    check(levelUpShot, 'fast bot: never took the level-up screenshot');
    check(s.streakText.includes('🔥'), `fast bot: streak tag should show the flame, got "${s.streakText}"`);
    r.fastBot = fast;
    r.topLayout = await layout('quiz at the top level');
    // wrong answers: each one lowers the rating and ends the streak; when the level drops the tag says so, gently
    const wrongs = [];
    let sawDrop = false;
    for (let i = 0; i < 6 && !sawDrop; i++) {
      if (i === 1) { await G(`__mathRing.answerIn(${FAST_BOT_SECS})`); }   // rebuild a streak so the next wrong answer has one to break
      before = await state();
      await G(`__mathRing.answerIn(${FAST_BOT_SECS}, false)`);
      s = await tagOk('wrong answer');
      wrongs.push({ rating: [before.rating, s.rating], streak: [before.streak, s.streak], level: [before.level + 1, s.level + 1] });
      check(s.rating < before.rating, `wrong answer: rating should go down (${before.rating} -> ${s.rating})`);
      check(s.streak === 0, 'wrong answer: streak should be 0');
      if (s.level < before.level) {
        sawDrop = true;
        check(s.streakText.includes('easier'), `level drop: the tag should say it gets a bit easier, got "${s.streakText}"`);
        await page.waitForTimeout(150); await shot('leveldown');
      }
      await page.waitForTimeout(650);
    }
    check(wrongs.some(w => w.streak[0] > 0), 'wrong answers: never tested breaking a live streak');
    check(sawDrop, 'wrong answers never dropped a level');
    r.wrongAnswers = wrongs;
    // ring -> ad -> game over, from this run
    r.ringAdOver = await ringAdOver();

    // --- run 3: slow but accurate bot (also checks that Play again starts from level 1) ---
    await page.tap('#againBtn');
    s = await tagOk('play again');
    check(s.phase === 'quiz' && s.level === 0 && s.rating === 0 && s.streak === 0 && s.streakText === '', 'Play again should start from level 1 with no streak');
    const steady = { levelAfter12: null, reachedTopAfter: null, levels: [] };
    for (let i = 1; i <= STEADY_BOT_MAX && !steady.reachedTopAfter; i++) {
      await G(`__mathRing.answerIn(${STEADY_BOT_SECS[i % STEADY_BOT_SECS.length]})`);
      s = await tagOk(`steady bot answer ${i}`);
      steady.levels.push(s.level + 1);
      if (i === 12) steady.levelAfter12 = s.level + 1;
      if (s.level === s.top) steady.reachedTopAfter = i;
    }
    check(steady.levelAfter12 !== null && steady.levelAfter12 < constants.top + 1, `steady bot was already on the top level after 12 answers`);
    check(steady.reachedTopAfter !== null, `steady bot did not reach the top level in ${STEADY_BOT_MAX} answers (levels: ${steady.levels})`);
    r.steadyBot = steady;

    // --- the rule itself: a player who is right every time, however slowly, never climbs slower than the old game ---
    const slowest = await G(`(() => { let r = 0, st = 0, worst = null; const lv = [];
      for (let n = 1; n <= ${OLD_LEVEL_EVERY} * __mathRing.topLevel; n++) { ({ rating: r, streak: st } = __mathRing.rate(r, st, 1e9, true));
        const now = Math.min(__mathRing.topLevel, Math.floor(r)), old = Math.min(__mathRing.topLevel, Math.floor(n / ${OLD_LEVEL_EVERY}));
        lv.push(now + 1); if (now < old && worst === null) worst = n; }
      return { slowerThanOldAt: worst, reachedTopAfter: lv.indexOf(__mathRing.topLevel + 1) + 1 }; })()`);
    check(slowest.slowerThanOldAt === null, `a slow, always-right player falls behind the old ramp at answer ${slowest.slowerThanOldAt}`);
    r.slowestRightPlayer = slowest;

    r.consoleErrors = errs;
    check(errs.length === 0, 'console errors: ' + errs.join(' | '));

    // --- simulation table (once): thousands of pretend players through the game's own ramp rule ---
    if (!out.simulation) out.simulation = await page.evaluate(simulate);
    await ctx.close();
  }

  // ---------- layout-only check on more phone sizes ----------
  for (const [name, dev] of Object.entries(LAYOUT_ONLY)) {
    const { ctx, page, errs } = await open(dev);
    const { G, check, shot, layout, cardFits } = kit(page, name);
    await cardFits('#startOv .card', 'start');
    await page.tap('#startBtn');
    for (let i = 0; i < 3; i++) await G('__mathRing.answerIn(1)');
    await page.waitForTimeout(450);
    const l = await layout('quiz'); await shot('streak');
    await G('__mathRing.time = 0.05');
    await page.waitForFunction(() => __mathRing.phase === 'ring');
    await page.waitForTimeout(1150);                              // past "get ready", ring still far out: an early tap is a miss
    await page.touchscreen.tap(page.viewportSize().width / 2, page.viewportSize().height * 0.6);
    await page.waitForSelector('#offerOv.show', { timeout: 4000 });
    await cardFits('#offerOv .card', 'ad offer');
    await page.tap('#noAdBtn');
    await page.waitForSelector('#overOv.show');
    await page.waitForTimeout(700);
    await cardFits('#overOv .card', 'game over'); await shot('over');
    check(errs.length === 0, 'console errors: ' + errs.join(' | '));
    out.layoutOnly[name] = { ...l, consoleErrors: errs };
    await ctx.close();
  }

  // ---------- SCORE_BY_DIFFICULTY = true, on a temporary copy of the game ----------
  {
    const name = 'points-mode';
    const src = fs.readFileSync(GAME, 'utf8'), flag = /const SCORE_BY_DIFFICULTY\s*=\s*false;/;
    if (!flag.test(src)) fails.push(`[${name}] could not find "const SCORE_BY_DIFFICULTY = false;" in the game file`);
    else {
      const copy = SHOT + 'mathring-points-mode-copy.html';
      fs.writeFileSync(copy, src.replace(flag, 'const SCORE_BY_DIFFICULTY = true;'));
      const { ctx, page, errs } = await open(PHONES['360x640'], copy);
      const { G, check, shot, state } = kit(page, name);
      await G(`localStorage.setItem('mathring.v1', JSON.stringify({ best: 7 }))`);   // an old best from the normal mode
      await page.reload();
      const pill0 = await page.textContent('#bestPill');
      check(pill0 === 'Best 0', `points mode should not show the normal mode's best, pill says "${pill0}"`);
      await page.tap('#startBtn');
      const floats = [];
      const RIGHT = 10;
      for (let i = 0; i < RIGHT; i++) {
        if (i === RIGHT - 1) await page.waitForTimeout(1000);     // let the earlier floats fade, so the screenshot shows one clean "+3"
        await G(`__mathRing.answerIn(${FAST_BOT_SECS})`);
        floats.push(await page.locator('.float.pts').last().textContent());
        if (i === RIGHT - 1) await shot('float');
        await page.waitForTimeout(60);
      }
      const s = await state();
      check(floats[0] === '+1' && floats.includes('+2') && floats.includes('+3'), `points mode: expected +1, +2 and +3 floats, got ${floats}`);
      check(s.score === floats.reduce((a, f) => a + +f, 0) && s.score > RIGHT, `points mode: score ${s.score} should be the sum of the floats (${floats}) and more than ${RIGHT}`);
      check(await page.textContent('#scoreLabel') === 'points', 'points mode: the score label should say "points"');
      await G('__mathRing.time = 0.05');
      await page.waitForFunction(() => __mathRing.phase === 'ring');
      await page.waitForTimeout(1150);
      await page.touchscreen.tap(180, 380);
      await page.waitForSelector('#offerOv.show', { timeout: 4000 });
      await page.tap('#noAdBtn');
      await page.waitForSelector('#overOv.show');
      const saved = await G(`JSON.parse(localStorage.getItem('mathring.v1'))`);
      check(saved.best === 7, `points mode changed the normal mode's best (now ${saved.best})`);
      check(saved.bestByLevel === s.score, `points mode best should be saved on its own (bestByLevel = ${saved.bestByLevel}, score ${s.score})`);
      check(await page.textContent('#oAcc') === '100%', 'points mode: accuracy should count answers, not points');
      check(errs.length === 0, 'console errors: ' + errs.join(' | '));
      out.pointsMode = { floats, score: s.score, rightAnswers: RIGHT, saved, consoleErrors: errs };
      await ctx.close();
      fs.unlinkSync(copy);
    }
  }

  out.screenshots = SHOT + 'mathring-*.png';
  out.failures = fails;
  out.ok = fails.length === 0;
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

// Runs inside the game page. Sends pretend players through the game's own ramp rule (__mathRing.rate), so the table
// always matches the constants in the game file. Seeded, so the numbers are the same on every run.
function simulate() {
  const TRIALS = 2000, MAX = 60, top = __mathRing.topLevel;
  let seed = 12345;
  const rnd = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const U = (a, b) => a + rnd() * (b - a);
  const players = {
    'Strong: always right, 1-2 s':         lv => ({ ok: true, secs: U(1, 2) }),
    'Steady: always right, 3-5 s':         lv => ({ ok: true, secs: U(3, 5) }),
    'Mixed: 70% right, 3-6 s':             lv => ({ ok: rnd() < 0.7, secs: U(3, 6) }),
    'Slow: always right, 8-12 s':          lv => ({ ok: true, secs: U(8, 12) }),
    'Learner: 95% right to level 3, 55% above, 3-6 s': lv => ({ ok: rnd() < (lv <= 2 ? 0.95 : 0.55), secs: U(3, 6) }),
  };
  const med = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const avg = a => +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
  const table = {};
  for (const [name, play] of Object.entries(players)) {
    const reach = [], at = { 12: [], 25: [], 40: [] }, band = [0, 0, 0]; let n = 0;
    for (let t = 0; t < TRIALS; t++) {
      let r = 0, st = 0, hit = 0;
      for (let i = 1; i <= MAX; i++) {
        const lv = Math.min(top, Math.floor(r)), a = play(lv);
        ({ rating: r, streak: st } = __mathRing.rate(r, st, a.secs, a.ok));
        const now = Math.min(top, Math.floor(r));
        if (!hit && now === top) hit = i;
        if (at[i]) at[i].push(now + 1);
        if (i <= 40) { band[Math.min(2, Math.floor(now / (top + 1) * 3))]++; n++; }
      }
      if (hit) reach.push(hit);
    }
    const pct = x => Math.round(x / n * 100) + '%';
    table[name] = {
      answersToTopLevel: reach.length === TRIALS ? { fastest: Math.min(...reach), typical: med(reach), slowest: Math.max(...reach) }
        : `only ${Math.round(reach.length / TRIALS * 100)}% of runs got there within ${MAX} answers`,
      averageLevelAfter: { 12: avg(at[12]), 25: avg(at[25]), 40: avg(at[40]) },
      shareOfFirst40Answers: { lowLevels: pct(band[0]), middleLevels: pct(band[1]), highLevels: pct(band[2]) },
    };
  }
  return { note: `old ramp: every always-right player needed ${4 * top} answers to reach the top level, whatever their speed`, levels: top + 1, table };
}
