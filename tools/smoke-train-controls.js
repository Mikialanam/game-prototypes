// Checks Train Switcher's three switch-control modes (Tap the rail, Lever, Arrow) on emulated phones:
// the Settings screen (gear on the start card and the pause card), the saved choice, rail taps along every branch, lever taps and
// slides, lever placement, the visible switch movement, the first-time hints, and a bot winning levels 1 and 2 with each mode's
// own kind of tap. Run: node tools/smoke-train-controls.js   (needs Playwright + Chromium). Prints a JSON summary; exits non-zero
// if a check fails or the page logs an error. Screenshots land in $SHOT_DIR, or in <temp dir>/train-switcher-shots.
const { chromium, devices } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const FILE = path.join(__dirname, '..', 'games', 'train-switcher', 'train-switcher.html');
const SHOT = path.resolve(process.env.SHOT_DIR || path.join(os.tmpdir(), 'train-switcher-shots')) + path.sep;
const MODES = ['rail', 'lever', 'arrow'];
const PHONES = {
  'iPhone 13': { ...devices['iPhone 13'], deviceScaleFactor: 2 },
  'iPhone SE': { ...devices['iPhone SE'], deviceScaleFactor: 2 },
  '360x640': { viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 },
};

(async () => {
  fs.mkdirSync(SHOT, { recursive: true });
  const browser = await chromium.launch();
  const errs = [], failed = []; let passed = 0;
  const summary = { settings: {}, rail: {}, lever: {}, movement: {}, hints: {}, extras: {}, bot: {} };
  const check = (name, ok, detail) => { if (ok) passed++; else failed.push(detail === undefined ? name : `${name} (${JSON.stringify(detail)})`); return ok; };

  let openCount = 0;
  async function open(phone) {
    const ctx = await browser.newContext(PHONES[phone]); const page = await ctx.newPage();
    page.on('pageerror', e => errs.push(`${phone}: pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errs.push(`${phone}: console: ${m.text()}`); });
    const host = `http://tsc-test-${++openCount}.local/`;   // own address per browser, so saved data can't leak between tests
    await ctx.route(host + '**', route => route.fulfill({ path: FILE, contentType: 'text/html; charset=utf-8' }));
    await page.goto(host + 'train-switcher.html');
    return { page, ctx };
  }
  const snap = page => page.evaluate(() => __trains.snapshot());
  const sw = async (page, id) => (await snap(page)).switches.find(w => w.id === id);
  const states = async page => Object.fromEntries((await snap(page)).switches.map(w => [w.id, w.state]));
  const at = (br, k, side = 0) => { const L = Math.hypot(br.bx - br.ax, br.by - br.ay), ux = (br.bx - br.ax) / L, uy = (br.by - br.ay) / L;
    return { x: br.ax + (br.bx - br.ax) * k - uy * side, y: br.ay + (br.by - br.ay) * k + ux * side }; };
  // a card must sit fully on screen without scrolling, every button at least 44px tall
  const card = (page, sel) => page.evaluate(sel => {
    const c = document.querySelector(sel + ' .card'), b = c.getBoundingClientRect();
    return { fits: b.top >= 0 && b.left >= 0 && b.bottom <= innerHeight && b.right <= innerWidth && c.scrollHeight <= c.clientHeight + 1,
      smallButtons: [...c.querySelectorAll('button')].filter(x => { const r = x.getBoundingClientRect(); return r.height < 44 || r.width < 44; }).map(x => x.textContent.trim()) };
  }, sel);
  // the move each mode makes to point switch s at branch i, with a real finger
  async function move(page, mode, s, i) {
    if (mode === 'rail') { const p = at(s.branches[i], .5); return page.touchscreen.tap(p.x, p.y); }
    if (mode === 'lever') return page.touchscreen.tap(s.lever.x, s.lever.y);
    return page.touchscreen.tap(s.x, s.y);
  }
  // a bot that plays with the mode's own taps: point each switch at the branch the next approaching vehicle needs
  async function playLevel(page, mode) {
    const t0 = Date.now();
    while (Date.now() - t0 < 120000) {
      const ph = await page.evaluate(() => __trains.phase); if (ph !== 'play') return ph;
      const s = await snap(page);
      for (const w of s.switches) {
        const next = s.trains.filter(t => t.at === w.id).sort((a, b) => a.d - b.d)[0]; if (!next) continue;
        const want = s.routes[w.id][next.colour];
        if (want !== w.state && !w.busy) { await move(page, mode, w, want); await page.waitForTimeout(30); }
      }
      await page.waitForTimeout(40);
    }
    return 'timeout';
  }

  // ---------- 1. Settings: default, gear on the start card and the pause card, saved choice, mid-level change ----------
  async function settings(phone) {
    const { page, ctx } = await open(phone), out = summary.settings[phone] = {};
    out.default = await page.evaluate(() => ({ controls: __trains.controls, how: document.getElementById('howTo').textContent }));
    check(`${phone}: default controls are Tap the rail`, out.default.controls === 'rail' && /track/.test(out.default.how), out.default);
    const sc = await card(page, '#startOv'); check(`${phone}: start card with gear fits the screen`, sc.fits && !sc.smallButtons.length, sc);
    await page.locator('#startOv .gear').tap(); await page.waitForSelector('#setOv.show');
    const st = await page.evaluate(() => ({ picks: [...document.querySelectorAll('#setOv .cpicker .pick')].map(b => ({ c: b.dataset.ctrl, on: b.classList.contains('on'), h: Math.round(b.getBoundingClientRect().height) })) }));
    check(`${phone}: Settings lists the three modes, Tap the rail lit, each at least 60px tall`, st.picks.map(p => p.c).join() === MODES.join() && st.picks[0].on && st.picks.every(p => p.h >= 60), st);
    const setc = await card(page, '#setOv'); check(`${phone}: Settings card fits the screen`, setc.fits && !setc.smallButtons.length, setc);
    await page.screenshot({ path: SHOT + `tsc-${phone.replace(/ /g, '')}-settings.png` });
    await page.locator('#setOv .pick[data-ctrl="lever"]').tap(); await page.locator('#setDone').tap();
    check(`${phone}: Settings closes back to the start card`, !(await page.isVisible('#setOv')) && await page.isVisible('#startOv'));
    await page.reload(); await page.waitForTimeout(150);
    out.afterReload = await page.evaluate(() => ({ controls: __trains.controls, how: document.getElementById('howTo').textContent }));
    check(`${phone}: chosen mode survives a reload`, out.afterReload.controls === 'lever' && /lever/i.test(out.afterReload.how), out.afterReload);
    // pause card: gear opens Settings; the game stays paused; a new mode applies straight away without restarting the level
    await page.click('#startBtn'); await page.evaluate(() => __trains.start(2));
    await page.waitForFunction(() => __trains.snapshot().trains.length > 0, null, { timeout: 8000 });
    await page.locator('#themeBtn').tap(); await page.waitForSelector('#themeOv.show');
    const head = await page.textContent('#themeHead'), pc = await card(page, '#themeOv');
    await page.locator('#themeOv .gear').tap(); await page.waitForSelector('#setOv.show');
    const d0 = (await snap(page)).trains[0].d; await page.waitForTimeout(300); const d1 = (await snap(page)).trains[0].d;
    await page.locator('#setOv .pick[data-ctrl="rail"]').tap(); await page.locator('#setDone').tap();
    out.pause = { head, stoodStill: d0 === d1, controls: await page.evaluate(() => __trains.controls), backOnPauseCard: await page.isVisible('#themeOv'), paused: await page.evaluate(() => __trains.paused) };
    await page.locator('#themeDone').tap(); await page.waitForTimeout(250);
    Object.assign(out.pause, { level: await page.evaluate(() => __trains.level), phase: await page.evaluate(() => __trains.phase), movesAgain: (await snap(page)).trains[0].d !== d1 });
    check(`${phone}: gear on the pause card changes mode mid-level, game stays paused, then resumes on the same level`,
      head === 'Paused' && pc.fits && !pc.smallButtons.length && out.pause.stoodStill && out.pause.controls === 'rail' && out.pause.backOnPauseCard && out.pause.paused && out.pause.level === 2 && out.pause.phase === 'play' && out.pause.movesAgain, { ...out.pause, pc });
    await ctx.close();
  }

  // ---------- 2. Rail taps: every branch, along its length and off to the side; stations; far taps; the switch itself ----------
  async function rail(phone) {
    const { page, ctx } = await open(phone), out = summary.rail[phone] = { wrong: [] };
    await page.evaluate(() => { __trains.setControls('rail'); __trains.start(4); });
    let taps = 0;
    // off to the side: 35px outwards (away from the switch's other branch), and inwards up to 35px but never past 40% of the gap
    // to the other branch (a tap closer to the other branch belongs to it)
    const lineDist = (p, b) => { const L = Math.hypot(b.bx - b.ax, b.by - b.ay); return ((p.x - b.ax) * (b.by - b.ay) - (p.y - b.ay) * (b.bx - b.ax)) / L; };
    for (const w of (await snap(page)).switches) for (const [i, br] of w.branches.entries()) for (const k of [.25, .5, .8]) for (const where of ['out', 'on', 'in']) {
      const sib = w.branches[1 - i], o = at(br, k), sideToSib = Math.abs(lineDist(at(br, k, 1), sib)) < Math.abs(lineDist(o, sib)) ? 1 : -1;   // +1: a positive side offset heads for the other branch
      const gap = Math.abs(lineDist(o, sib)), side = where === 'on' ? 0 : where === 'out' ? -35 * sideToSib : Math.min(35, .4 * gap) * sideToSib;
      // start each tap with the switch pointing the other way, so every tap has to move it
      await page.evaluate(() => __trains.start(4)); await page.evaluate(([id, v]) => { const s = __trains._switch(id); s.state = s.anim = v; }, [w.id, 1 - i]);
      const before = await states(page), p = at(br, k, side), vw = await page.evaluate(() => innerWidth);
      if (p.x < 4 || p.x > vw - 4) continue;   // off the side of a small screen
      await page.touchscreen.tap(p.x, p.y); taps++;
      const after = await states(page), changed = Object.keys(after).filter(id => after[id] !== before[id]);
      if (!(after[w.id] === i && changed.join() === w.id)) out.wrong.push({ branch: `${w.id}->${br.to}`, k, side, changed });
    }
    out.taps = taps;
    check(`${phone}: rail taps along every branch (3 places, up to 35px off the line) move only that switch onto that branch`, !out.wrong.length, out.wrong.slice(0, 5));
    // tapping the branch it is already on keeps it there
    await page.evaluate(() => __trains.start(1)); let s1 = await sw(page, 's1');
    let p = at(s1.branches[s1.state], .5); await page.touchscreen.tap(p.x, p.y);
    check(`${phone}: tapping the branch already set keeps it`, (await sw(page, 's1')).state === s1.state);
    // a station counts as part of its branch
    const other = 1 - s1.state; await page.touchscreen.tap(s1.branches[other].bx, s1.branches[other].by);
    check(`${phone}: tapping a station moves its switch towards it`, (await sw(page, 's1')).state === other);
    // the switch itself flips; far from every track nothing happens
    s1 = await sw(page, 's1'); await page.waitForTimeout(350); await page.touchscreen.tap(s1.x, s1.y);
    check(`${phone}: tapping the switch itself flips it`, (await sw(page, 's1')).state === 1 - s1.state);
    const st = await states(page), stage = await page.evaluate(() => __trains.layout().stage);
    await page.touchscreen.tap(stage.x + 12, stage.y + 40);
    check(`${phone}: a tap far from every track moves nothing`, JSON.stringify(await states(page)) === JSON.stringify(st));
    await ctx.close();
  }

  // ---------- 3. Levers: placement on every level shape, lean, tap, slide ----------
  async function lever(phone) {
    const { page, ctx } = await open(phone), out = summary.lever[phone] = { layouts: {} };
    await page.evaluate(() => __trains.setControls('lever'));
    for (const L of [1, 2, 4]) {
      await page.evaluate(l => __trains.start(l), L);
      const lay = await page.evaluate(() => { const L = __trains.layout(), S = __trains.snapshot().switches, problems = [];
        S.forEach((a, i) => { const v = a.lever;
          if (v.clear < 0) problems.push(`${a.id} lever is too close to a track, station or switch (${v.clear.toFixed(1)}px)`);
          if (v.x - v.r < 0 || v.x + v.r > innerWidth || v.y - v.r < L.stage.y || v.y + v.r > L.stage.y + L.stage.h) problems.push(`${a.id} lever is off screen`);
          S.forEach((b, j) => { if (j > i && Math.hypot(v.x - b.lever.x, v.y - b.lever.y) < v.r * 2) problems.push(`${a.id} and ${b.id} levers overlap`); });
          const act = a.branches[a.state]; if (Math.sign(act.bx - act.ax) !== v.lean) problems.push(`${a.id} lever leans the wrong way`); });
        return { problems, clear: S.map(s => Math.round(s.lever.clear)) }; });
      out.layouts['level ' + L] = lay;
      check(`${phone}: level ${L} levers sit clear of tracks, stations and each other, on screen, leaning the way the track goes`, !lay.problems.length, lay.problems);
      await page.waitForTimeout(250); await page.screenshot({ path: SHOT + `tsc-${phone.replace(/ /g, '')}-lever-L${L}.png` });
    }
    const res = [];
    for (const w of (await snap(page)).switches) {
      const s0 = w.state; await page.touchscreen.tap(w.lever.x + 8, w.lever.y + 8); await page.waitForTimeout(350);
      const s1 = (await sw(page, w.id)); const tap = s1.state !== s0, leanOk = s1.lever.lean === Math.sign(s1.branches[s1.state].bx - s1.branches[s1.state].ax);
      // slide towards the other side: flips. Slide the way it already leans: nothing.
      const dir = Math.sign(s1.branches[1 - s1.state].bx - s1.branches[s1.state].bx);
      await page.mouse.move(s1.lever.x, s1.lever.y); await page.mouse.down(); await page.mouse.move(s1.lever.x + dir * 40, s1.lever.y + 4, { steps: 6 }); await page.mouse.up();
      await page.waitForTimeout(350); const s2 = await sw(page, w.id);
      await page.mouse.move(s2.lever.x, s2.lever.y); await page.mouse.down(); await page.mouse.move(s2.lever.x + dir * 40, s2.lever.y + 4, { steps: 6 }); await page.mouse.up();
      await page.waitForTimeout(100); const s3 = await sw(page, w.id);
      res.push({ id: w.id, tap, leanOk, slideOver: s2.state !== s1.state, slideSameWayIgnored: s3.state === s2.state });
    }
    out.moves = res;
    check(`${phone}: every lever flips on a tap, flips on a slide to the other side, ignores a slide the way it leans`, res.every(r => r.tap && r.leanOk && r.slideOver && r.slideSameWayIgnored), res);
    // in lever mode, tapping the track does nothing
    await page.evaluate(() => __trains.start(1)); const s1 = await sw(page, 's1'), p = at(s1.branches[1 - s1.state], .5);
    await page.touchscreen.tap(p.x, p.y); check(`${phone}: lever mode ignores taps on the track`, (await sw(page, 's1')).state === s1.state);
    await ctx.close();
  }

  // ---------- 4. The switch visibly moves (every mode): part-way through soon after the tap, settled a moment later ----------
  async function movement() {
    const { page, ctx } = await open('360x640');
    for (const mode of MODES) {
      await page.evaluate(m => { __trains.setControls(m); __trains.start(2); }, mode);
      const w = await sw(page, 's1'), target = 1 - w.state;
      await move(page, mode, w, target);
      const mid = (await sw(page, 's1')).anim; await page.waitForTimeout(80); const mid2 = (await sw(page, 's1')).anim;
      await page.waitForTimeout(400); const end = await sw(page, 's1');
      const between = [mid, mid2].some(a => a > 0.02 && a < 0.98);
      summary.movement[mode] = { mid: +mid.toFixed(2), mid2: +mid2.toFixed(2), end: end.anim, state: end.state };
      check(`${mode}: the switch swings across over time (seen part-way), then rests on the new branch`, between && end.state === target && end.anim === target, summary.movement[mode]);
    }
    await page.evaluate(() => { __trains.setControls('rail'); __trains.start(1); });
    const s = await sw(page, 's1'); await page.touchscreen.tap(s.x, s.y); await page.waitForTimeout(90);
    await page.screenshot({ path: SHOT + 'tsc-rail-moving.png' });
    await ctx.close();
  }

  // ---------- 5. First-time tutorial: one hand shows one flip on level 1, then disappears; once won, not again ----------
  async function hints(mode, phone) {
    const { page, ctx } = await open(phone), out = summary.hints[mode] = {};
    await page.evaluate(m => __trains.setControls(m), mode);
    await page.click('#startBtn');
    const s0 = (await sw(page, 's1')).state;
    await page.waitForFunction(() => { const h = __trains.hint; return h.spot && h.t > 1.0; }, null, { timeout: 5000 });
    const h = await page.evaluate(() => __trains.hint), noTrainYet = (await snap(page)).trains.length === 0;
    out.during = h;
    check(`${mode}: tutorial hand and caption show on level 1, and the first vehicle waits`, h.on && !!h.spot && h.caption.length > 0 && noTrainYet && (await sw(page, 's1')).state === s0, { h, noTrainYet });
    await page.screenshot({ path: SHOT + `tsc-hint-${mode}.png` });
    const cap = await page.evaluate(() => { const r = document.getElementById('hint').getBoundingClientRect(); return { h: Math.round(r.height), left: r.left, right: r.right }; });
    check(`${mode}: tutorial caption is one line and on screen`, cap.h <= 44 && cap.left >= 0 && cap.right <= (await page.evaluate(() => innerWidth)), cap);
    // with no input at all, the hand flips the switch once, to the first vehicle's station, then goes away
    await page.waitForFunction(() => __trains.hint.flipped, null, { timeout: 5000 });
    await page.waitForTimeout(150); await page.screenshot({ path: SHOT + `tsc-hint-${mode}-flipped.png` });
    await page.waitForFunction(() => !__trains.hint.on, null, { timeout: 5000 });
    await page.waitForFunction(() => __trains.snapshot().trains.length > 0, null, { timeout: 8000 });
    const s = await snap(page), first = s.trains[0];
    out.after = { flippedTo: s.switches[0].state, need: s.routes.s1[first.colour], route: await page.evaluate(() => __trains.route), hint: await page.evaluate(() => __trains.hint) };
    check(`${mode}: the hand flips the switch by itself, onto the first vehicle's route, then disappears`,
      out.after.flippedTo !== s0 && out.after.flippedTo === out.after.need && !out.after.hint.spot && !out.after.hint.caption, out.after);
    out.result = await playLevel(page, mode);
    check(`${mode}: level 1 is won after the tutorial`, out.result === 'win', out.result);
    await page.waitForSelector('#winOv.show'); await page.waitForTimeout(600); await page.click('#nextBtn'); await page.waitForTimeout(300);
    check(`${mode}: no tutorial on level 2`, !(await page.evaluate(() => __trains.hint.on)));
    await page.evaluate(() => __trains.start(1)); await page.waitForTimeout(100);
    check(`${mode}: once level 1 is won the tutorial doesn't come back (even after a reload)`, !(await page.evaluate(() => __trains.hint.on)) &&
      await page.reload().then(() => page.evaluate(() => (__trains.start(1), !__trains.hint.on))));
    // Settings: "Show the first-time hint again" brings it back for the next child
    await page.locator('#themeBtn').tap(); await page.locator('#themeOv .gear').tap(); await page.locator('#hintsAgain').tap();
    await page.locator('#setDone').tap(); await page.locator('#themeDone').tap(); await page.evaluate(() => __trains.start(1)); await page.waitForTimeout(150);
    check(`${mode}: "Show the first-time hint again" brings it back on level 1`, await page.evaluate(() => __trains.hint.on));
    // the player moving a switch during the demo stops it (the hand never undoes their move)
    await page.waitForFunction(() => __trains.hint.spot, null, { timeout: 5000 });
    const w = await sw(page, 's1'); await move(page, mode, w, 1 - w.state); await page.waitForTimeout(2500);
    const mine = await sw(page, 's1');
    check(`${mode}: a player's own flip during the demo ends it and stays`, mine.state === 1 - w.state && !(await page.evaluate(() => __trains.hint.on)), { before: w.state, now: mine.state });
    await ctx.close();
  }

  // ---------- 5b. Sound on/off, level 1 is easy on every difficulty, the active route ----------
  async function extras() {
    const { page, ctx } = await open('360x640'), out = summary.extras = {};
    await page.evaluate(() => { localStorage.setItem('trainswitcher.v1', JSON.stringify({ hints: { rail: true } })); }); await page.reload();
    await page.evaluate(() => __trains.start(2));
    let w = await sw(page, 's1'), n0 = await page.evaluate(() => __trains.soundsPlayed);
    await move(page, 'rail', w, 1 - w.state); await page.waitForTimeout(50);
    out.soundOnFlip = (await page.evaluate(() => __trains.soundsPlayed)) - n0;
    check('a switch flip plays a sound (sound on by default)', out.soundOnFlip >= 1 && await page.evaluate(() => __trains.sound), out);
    await page.locator('#themeBtn').tap(); await page.locator('#themeOv .gear').tap();
    out.soundLabel = (await page.textContent('#soundBtn')).trim(); await page.locator('#soundBtn').tap(); out.soundLabelOff = (await page.textContent('#soundBtn')).trim();
    await page.locator('#setDone').tap(); await page.locator('#themeDone').tap(); await page.reload(); await page.evaluate(() => __trains.start(2));
    w = await sw(page, 's1'); n0 = await page.evaluate(() => __trains.soundsPlayed);
    await move(page, 'rail', w, 1 - w.state); await page.waitForTimeout(50);
    out.soundWhenMuted = (await page.evaluate(() => __trains.soundsPlayed)) - n0;
    check('Settings sound toggle mutes every sound, and it survives a reload', /on/i.test(out.soundLabel) && /off/i.test(out.soundLabelOff) && out.soundWhenMuted === 0 && (await sw(page, 's1')).state === 1 - w.state && !(await page.evaluate(() => __trains.sound)), out);
    out.level1 = await page.evaluate(() => ['kid', 'adult', 'expert'].map(d => { __trains.setDifficulty(d); return { d, ...__trains.cfg(1), l2: __trains.cfg(2).speed }; }));
    check('level 1 is the same easy warm-up on every difficulty: 2 stations (one switch), 3 vehicles, slower than level 2',
      out.level1.every(c => c.stations === 2 && c.trains === 3 && c.speed <= 0.08 + 1e-9 && c.speed < c.l2), out.level1);
    await page.evaluate(() => __trains.start(1)); check('level 1 has exactly one switch', (await snap(page)).switches.length === 1);
    // active route: follows the switches from the entry to a station, and moves when a switch moves
    await page.evaluate(() => __trains.start(4));
    const r0 = await page.evaluate(() => __trains.route); w = await sw(page, 's1'); await move(page, 'rail', w, 1 - w.state);
    const r1 = await page.evaluate(() => __trains.route);
    out.route = { r0, r1 };
    check('the highlighted route runs entry → switches → a station and changes when a switch moves', r0.edges[0] === 'e>0' && r0.edges.length === 3 && /^[a-d]$/.test(r0.station) && r1.station !== r0.station, out.route);
    await ctx.close();
  }

  // ---------- 6. A bot wins levels 1 and 2 in every mode, on the small phones, using that mode's own taps ----------
  async function bot(mode, phone) {
    const { page, ctx } = await open(phone), out = summary.bot[`${mode} ${phone}`] = [];
    await page.evaluate(m => { __trains.setControls(m); __trains.setTheme(m === 'rail' ? 'trains' : m === 'lever' ? 'boats' : 'planes'); }, mode);
    await page.click('#startBtn');
    for (const L of [1, 2]) {
      const r = await playLevel(page, mode); out.push(r);
      if (!check(`${phone}, ${mode}: bot wins level ${L} with ${mode} taps`, r === 'win', r)) break;
      await page.waitForSelector('#winOv.show'); await page.waitForTimeout(600);
      if (L === 1) await page.click('#nextBtn');
    }
    await page.evaluate(() => __trains.start(4)); await page.waitForTimeout(2600);
    await page.screenshot({ path: SHOT + `tsc-${phone.replace(/ /g, '')}-${mode}-L4.png` });
    await ctx.close();
  }

  await Promise.all([
    ...Object.keys(PHONES).map(settings), rail('360x640'), rail('iPhone SE'), ...Object.keys(PHONES).map(lever), movement(),
    ...MODES.map(m => hints(m, 'iPhone SE')), extras(), ...MODES.flatMap(m => ['iPhone SE', '360x640'].map(p => bot(m, p))),
  ]);
  check('no console errors', !errs.length, errs);
  const result = { ...summary, checks: { passed, failed }, errs, screenshots: SHOT, ok: !failed.length && !errs.length };
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
  process.exit(result.ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
