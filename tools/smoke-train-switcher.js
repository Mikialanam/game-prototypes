// Plays Train Switcher in all three themes on emulated phones and checks the big switch buttons, the tap zone and the theme picker.
// The bots tap the centre of each switch, which works in every control mode; the switch-control modes have their own test, smoke-train-controls.js.
// Run: node tools/smoke-train-switcher.js   (needs Playwright + Chromium). Prints a JSON summary; exits non-zero if a check fails
// or the page logs an error. Screenshots land in $SHOT_DIR, or in <temp dir>/train-switcher-shots.
const { chromium, devices } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const FILE = path.join(__dirname, '..', 'games', 'train-switcher', 'train-switcher.html');
const SHOT = path.resolve(process.env.SHOT_DIR || path.join(os.tmpdir(), 'train-switcher-shots')) + path.sep;
const REQUIRED = ['trains', 'boats', 'planes'];
const PHONES = {
  'iPhone 13': { ...devices['iPhone 13'], deviceScaleFactor: 2 },
  'iPhone SE': { ...devices['iPhone SE'], deviceScaleFactor: 2 },
  '360x640': { viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 },
};

(async () => {
  fs.mkdirSync(SHOT, { recursive: true });
  const browser = await chromium.launch();
  const errs = [], failed = []; let passed = 0;
  const summary = { themes: {}, phones: {}, tapZone: {}, busyFlip: {}, pause: {} };
  const check = (name, ok, detail) => { if (ok) passed++; else failed.push(detail === undefined ? name : `${name} (${JSON.stringify(detail)})`); return ok; };

  let openCount = 0;
  async function open(phone, file = FILE) {
    const ctx = await browser.newContext(PHONES[phone]); const page = await ctx.newPage();
    page.on('pageerror', e => errs.push(`${phone}: pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errs.push(`${phone}: console: ${m.text()}`); });
    // each test browser gets its own made-up web address, so saved data (best levels, theme) can't leak between tests running side by side
    const host = `http://tsw-test-${++openCount}.local/`;
    await ctx.route(host + '**', route => route.fulfill({ path: file, contentType: 'text/html; charset=utf-8' }));
    await page.goto(host + 'train-switcher.html');
    return { page, ctx };
  }
  const snap = page => page.evaluate(() => __trains.snapshot());
  const text = (page, sel) => page.textContent(sel);
  // True when every vehicle heading for a switch will find it pointing the right way: a safe moment to stop and take a picture.
  const settled = s => s.trains.every(t => !s.routes[t.at] || s.routes[t.at][t.colour] === s.switches.find(w => w.id === t.at).state);
  // The same bot as tools/smoke-test-2.js: point each switch at the branch the next approaching vehicle needs.
  async function playLevel(page, onTick) {
    const t0 = Date.now();
    while (Date.now() - t0 < 120000) {
      const ph = await page.evaluate(() => __trains.phase); if (ph !== 'play') return ph;
      const s = await snap(page);
      for (const sw of s.switches) {
        const next = s.trains.filter(t => t.at === sw.id).sort((a, b) => a.d - b.d)[0];
        if (!next) continue;
        const want = s.routes[sw.id][next.colour];
        if (want !== sw.state && !sw.busy) await page.mouse.click(sw.x, sw.y);
      }
      if (onTick) await onTick(await snap(page));
      await page.waitForTimeout(40);
    }
    return 'timeout';
  }
  // Switch buttons must not touch each other, a station or the edges; stations must fit; nothing scrolls sideways.
  const layout = page => page.evaluate(() => {
    const L = __trains.layout(), S = __trains.snapshot().switches, r = L.switchR, problems = [];
    S.forEach((a, i) => {
      if (a.y - r < L.stage.y + 4) problems.push(`${a.id} touches the top edge`);
      if (a.x - r < 2 || a.x + r > innerWidth - 2) problems.push(`${a.id} leaves the screen sideways`);
      S.forEach((b, j) => { if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 2 * r + 8) problems.push(`${a.id} overlaps ${b.id}`); });
      L.stations.forEach(st => { const dx = Math.max(Math.abs(a.x - st.x) - st.w / 2, 0), dy = Math.max(st.top - a.y, a.y - st.bottom, 0);
        if (Math.hypot(dx, dy) < r + 4) problems.push(`${a.id} overlaps station ${st.id}`); });
    });
    L.stations.forEach((a, i) => {
      if (a.x - a.w / 2 < 0 || a.x + a.w / 2 > innerWidth || a.bottom > innerHeight) problems.push(`station ${a.id} is cut off`);
      L.stations.forEach((b, j) => { if (j > i && Math.abs(a.x - b.x) < (a.w + b.w) / 2) problems.push(`stations ${a.id} and ${b.id} overlap`); });
    });
    if (document.documentElement.scrollWidth > innerWidth) problems.push('the page scrolls sideways');
    return { switchSize: Math.round(2 * r), tapRadius: Math.round(L.tapR), problems };
  });
  // A card must sit fully on screen without scrolling, with every button at least 48px tall.
  const card = (page, sel) => page.evaluate(sel => {
    const c = document.querySelector(sel + ' .card'), b = c.getBoundingClientRect();
    return { fits: b.top >= 0 && b.left >= 0 && b.bottom <= innerHeight && b.right <= innerWidth && c.scrollHeight <= c.clientHeight + 1,
      smallButtons: [...c.querySelectorAll('button')].filter(x => x.getBoundingClientRect().height < 48).map(x => x.textContent.trim()) };
  }, sel);
  const waitBusy = async page => { for (let i = 0; i < 600; i++) { const b = (await snap(page)).switches.find(w => w.busy); if (b) return b; await page.waitForTimeout(25); } return null; };

  // ---------- 1. every theme on an iPhone 13: pick it on the start card, win levels 1 and 2 ----------
  async function playTheme(theme) {
    const { page, ctx } = await open('iPhone 13');
    const words = await page.evaluate(t => THEMES[t], theme);
    if (!check(`${theme}: is in the THEMES table`, !!words)) return ctx.close();
    const out = summary.themes[theme] = {};
    await page.locator(`#startOv .pick[data-theme="${theme}"]`).tap();
    await page.waitForTimeout(150);
    const start = await page.evaluate(() => ({ theme: __trains.theme, header: document.querySelector('#title').textContent, title: document.querySelector('#startTitle').textContent,
      rules: [...document.querySelectorAll('#startOv .rule')].filter(p => !p.hidden).map(p => p.textContent).join(' '),
      lit: [...document.querySelectorAll('#startOv .picker .pick.on')].map(b => b.dataset.theme),
      pickHeights: [...document.querySelectorAll('#startOv .picker .pick')].map(b => Math.round(b.getBoundingClientRect().height)) }));
    check(`${theme}: picked on the start card and lit up`, start.theme === theme && start.lit.join() === theme, start);
    check(`${theme}: picker has a button per theme, each at least 64px tall`, start.pickHeights.length >= 3 && start.pickHeights.every(h => h >= 64), start.pickHeights);
    check(`${theme}: start card uses the theme's words`, start.header === words.title && start.title === words.title && start.rules.includes(words.one) && start.rules.includes(words.place), start);
    const sc = await card(page, '#startOv'); check(`${theme}: start card fits the screen`, sc.fits && !sc.smallButtons.length, sc);
    await page.screenshot({ path: SHOT + `tsw-${theme}-start.png` });
    await page.click('#startBtn');
    out.levels = [];
    for (let L = 1; L <= 2; L++) {
      let shot = false;
      const r = await playLevel(page, async s => {
        if (shot || s.trains.length < 2 || !settled(s)) return;
        shot = true; await page.screenshot({ path: SHOT + `tsw-${theme}-play-L${L}.png` });
      });
      out.levels.push(r);
      if (!check(`${theme}: bot wins level ${L}`, r === 'win', r)) break;
      await page.waitForSelector('#winOv.show'); await page.waitForTimeout(700);
      if (L === 1) await page.click('#nextBtn');
    }
    if (out.levels.join() === 'win,win') {
      await page.screenshot({ path: SHOT + `tsw-${theme}-win.png` });
      out.winSub = await text(page, '#winSub'); out.bestPill = await text(page, '#bestPill');
      check(`${theme}: win card uses the theme's words`, out.winSub.includes(words.many) && out.winSub.includes(words.places), out.winSub);
      check(`${theme}: best level saved`, /Best 2$/.test(out.bestPill), out.bestPill);
      const wc = await card(page, '#winOv'); check(`${theme}: win card fits the screen`, wc.fits && !wc.smallButtons.length, wc);
      // change theme from the win card: only the look and words change, the best level and the level reached stay
      const other = REQUIRED.find(t => t !== theme), otherWords = await page.evaluate(t => THEMES[t], other);
      await page.locator('#winOv .themeOpen').tap(); await page.waitForSelector('#themeOv.show');
      await page.locator(`#themeOv .pick[data-theme="${other}"]`).tap(); await page.waitForTimeout(100);
      const swapped = { theme: await page.evaluate(() => __trains.theme), sub: await text(page, '#winSub'), pill: await text(page, '#bestPill'), phase: await page.evaluate(() => __trains.phase), level: await page.evaluate(() => __trains.level) };
      check(`${theme}: theme can be changed on the win card without losing progress`, swapped.theme === other && swapped.sub.includes(otherWords.many) && /Best 2$/.test(swapped.pill) && swapped.phase === 'win' && swapped.level === 2, swapped);
      await page.locator(`#themeOv .pick[data-theme="${theme}"]`).tap(); await page.locator('#themeDone').tap();
      check(`${theme}: picker closes back to the win card`, !(await page.isVisible('#themeOv')) && await page.isVisible('#winOv'));
      // reload: the theme and the best level are remembered
      await page.reload(); await page.waitForTimeout(200);
      out.afterReload = { theme: await page.evaluate(() => __trains.theme), header: await text(page, '#title'), bestPill: await text(page, '#bestPill') };
      check(`${theme}: theme and best level survive a reload`, out.afterReload.theme === theme && out.afterReload.header === words.title && /Best 2$/.test(out.afterReload.bestPill), out.afterReload);
    }
    await ctx.close();
  }

  // ---------- 2. small phones: layout of every level shape, and level 4 (four stations) mid-play ----------
  async function phone(name, tag, mustWin) {
    const { page, ctx } = await open(name);
    const out = summary.phones[name] = { layouts: {} };
    const sc = await card(page, '#startOv'); check(`${name}: start card fits the screen`, sc.fits && !sc.smallButtons.length, sc);
    await page.screenshot({ path: SHOT + `tsw-${tag}-start.png` });
    for (const L of [1, 2, 4]) {
      await page.evaluate(l => __trains.start(l), L);
      const lay = out.layouts['level ' + L] = await layout(page);
      check(`${name}: level ${L} layout has no overlaps`, !lay.problems.length, lay.problems);
      check(`${name}: level ${L} switch button is big (at least 70px) and the tap zone is bigger`, lay.switchSize >= 70 && lay.tapRadius >= lay.switchSize / 2 + 12, lay);
    }
    // level 4 again from the top, played by the bot; one picture per theme while it plays (a theme change never touches the game)
    await page.evaluate(() => { __trains.setTheme('trains'); __trains.start(4); });
    const todo = [...REQUIRED];
    out.level4 = await playLevel(page, async s => {
      if (!todo.length || s.trains.length < 2 || !settled(s)) return;
      const theme = todo.shift(); await page.evaluate(t => __trains.setTheme(t), theme); await page.waitForTimeout(60);
      await page.screenshot({ path: SHOT + `tsw-${tag}-level4-${theme}.png` });
    });
    check(`${name}: level 4 pictures taken in every theme`, !todo.length, todo);
    if (mustWin) check(`${name}: bot wins level 4 (four stations)`, out.level4 === 'win', out.level4);
    await ctx.close();
  }

  // ---------- 3. tap zone, busy switch, pause: on the 360x640 screen ----------
  async function tapZone() {
    const { page, ctx } = await open('360x640');
    await page.evaluate(() => __trains.setControls && __trains.setControls('arrow'));   // the tap-zone rules below are the Arrow controls
    const out = summary.tapZone, state = async id => (await snap(page)).switches.find(w => w.id === id).state;
    out.tapRadiusConstant = await page.evaluate(() => TAP_RADIUS);
    // a tap 55px from the centre, on any side, still flips the switch
    // (each tap starts from a fresh level, so no vehicle can be on the switch yet)
    let sw; out.offCentre = [];
    for (const [dx, dy] of [[55, 0], [-55, 0], [0, 55], [0, -55], [39, 39]]) {
      await page.evaluate(() => __trains.start(1)); sw = (await snap(page)).switches[0];
      await page.touchscreen.tap(sw.x + dx, sw.y + dy); const after = await state('s1');
      out.offCentre.push({ dx, dy, flipped: sw.state !== after });
    }
    check('a tap 55px away from a switch flips it', out.offCentre.every(t => t.flipped), out.offCentre);
    await page.waitForTimeout(30); await page.screenshot({ path: SHOT + 'tsw-tap-pulse.png' });
    // a tap far from every switch does nothing
    const reach = (await page.evaluate(() => __trains.layout())).tapR, before = await state('s1');
    await page.touchscreen.tap(sw.x, sw.y + reach + 20); out.farTapFlipped = before !== await state('s1');
    check('a tap far from every switch flips nothing', !out.farTapFlipped);
    // between two switches the nearest one wins
    out.between = [];
    for (const [a, b, k] of [['s2', 's3', .4], ['s2', 's3', .6], ['s1', 's2', .42], ['s1', 's3', .58]]) {
      await page.evaluate(() => __trains.start(4));
      const S = Object.fromEntries((await snap(page)).switches.map(w => [w.id, w]));
      const x = S[a].x + (S[b].x - S[a].x) * k, y = S[a].y + (S[b].y - S[a].y) * k, near = k < .5 ? a : b;
      const s0 = Object.fromEntries(Object.values(S).map(w => [w.id, w.state]));
      await page.touchscreen.tap(x, y);
      const s1 = Object.fromEntries((await snap(page)).switches.map(w => [w.id, w.state]));
      out.between.push({ between: a + '-' + b, nearest: near, px: Math.round(Math.hypot(x - S[near].x, y - S[near].y)), flipped: Object.keys(s0).filter(id => s0[id] !== s1[id]) });
    }
    check('a tap between two switches flips only the nearest one', out.between.every(t => t.flipped.join() === t.nearest), out.between);

    // the header theme button pauses the game while the picker is open
    await page.evaluate(() => { __trains.setTheme('trains'); __trains.start(1); });
    await page.waitForFunction(() => __trains.snapshot().trains.length > 0);
    await page.locator('#themeBtn').tap(); await page.waitForSelector('#themeOv.show');
    const d0 = (await snap(page)).trains[0].d; await page.waitForTimeout(400); const d1 = (await snap(page)).trains[0].d;
    await page.locator('#themeOv .pick[data-theme="boats"]').tap(); await page.waitForTimeout(150);
    await page.screenshot({ path: SHOT + 'tsw-picker-paused.png' });
    const pc = await card(page, '#themeOv');
    summary.pause = { paused: await page.evaluate(() => __trains.paused), stoodStill: d0 === d1, button: await text(page, '#themeDone'), theme: await page.evaluate(() => __trains.theme) };
    await page.locator('#themeDone').tap(); await page.waitForTimeout(300);
    const d2 = (await snap(page)).trains[0].d;
    Object.assign(summary.pause, { movesAgain: d2 !== d1, phase: await page.evaluate(() => __trains.phase), level: await page.evaluate(() => __trains.level) });
    check('header theme button pauses play, changes theme and resumes', summary.pause.paused && summary.pause.stoodStill && summary.pause.theme === 'boats' && summary.pause.movesAgain && summary.pause.phase === 'play' && summary.pause.level === 1 && pc.fits && !pc.smallButtons.length, { ...summary.pause, pc });

    // default difficulty (Kid): tapping a busy switch does nothing; it shakes and stays put, nothing crashes
    await page.evaluate(() => { __trains.setTheme('trains'); __trains.start(1); });
    const safeRuleShown = await page.evaluate(() => !document.querySelector('#ruleSafe').hidden && document.querySelector('#ruleCrash').hidden);
    const busy = await waitBusy(page);
    if (check('a vehicle reaches the switch', !!busy)) {
      await page.touchscreen.tap(busy.x + 55, busy.y);
      await page.waitForTimeout(120); await page.screenshot({ path: SHOT + 'tsw-gentle-refused.png' });
      const after = (await snap(page)).switches[0];
      summary.busyFlip.gentle = { difficulty: await page.evaluate(() => __trains.difficulty), crash: await page.evaluate(() => __trains.crash), safeRuleShown, phase: await page.evaluate(() => __trains.phase), stateKept: after.state === busy.state };
      check('default difficulty is Kid with no crashes: a busy switch refuses to flip',
        summary.busyFlip.gentle.difficulty === 'kid' && summary.busyFlip.gentle.crash === false && safeRuleShown && summary.busyFlip.gentle.phase === 'play' && summary.busyFlip.gentle.stateKept, summary.busyFlip.gentle);
    }
    await ctx.close();
  }

  // ---------- 4. difficulty and speed: Expert crashes, levels scale, speed changes mid-level, bests kept per difficulty ----------
  async function crashRule() {
    const { page, ctx } = await open('360x640');
    // level 2: level 1 is the same easy warm-up on every difficulty
    const D = await page.evaluate(() => ({ kid: (__trains.setDifficulty('kid'), __trains.cfg(2)), adult: (__trains.setDifficulty('adult'), __trains.cfg(2)), expert: (__trains.setDifficulty('expert'), __trains.cfg(2)) }));
    summary.difficulty = D;
    check('Kid is slower and gentler than Adult, Adult than Expert', D.kid.speed < D.adult.speed && D.adult.speed < D.expert.speed && D.kid.gap > D.adult.gap && D.adult.gap > D.expert.gap && D.kid.trains <= D.adult.trains && D.adult.trains <= D.expert.trains, D);
    const crashRuleShown = await page.evaluate(() => document.querySelector('#ruleSafe').hidden && !document.querySelector('#ruleCrash').hidden);
    await page.evaluate(() => __trains.start(1));
    const busy = await waitBusy(page);
    if (check('Expert: a vehicle reaches the switch', !!busy)) {
      await page.touchscreen.tap(busy.x + 55, busy.y);
      await page.waitForTimeout(250); await page.screenshot({ path: SHOT + 'tsw-crash-moment.png' });
      await page.waitForSelector('#failOv.show', { timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(200); await page.screenshot({ path: SHOT + 'tsw-crash-card.png' });
      summary.busyFlip.crash = { crashRuleShown, phase: await page.evaluate(() => __trains.phase), title: await text(page, '#failTitle') };
      const want = await page.evaluate(() => THEMES.trains.crashTitle), fc = await card(page, '#failOv');
      check('Expert: tapping a busy switch crashes', crashRuleShown && summary.busyFlip.crash.phase === 'fail' && summary.busyFlip.crash.title === want && await page.isVisible('#failOv'), summary.busyFlip.crash);
      check('fail card fits the screen', fc.fits && !fc.smallButtons.length, fc);
    }
    // speed: changes straight away mid-level, no restart
    await page.evaluate(() => { __trains.setSpeed('normal'); __trains.start(2); });
    await page.waitForTimeout(1500);
    const sp = await page.evaluate(() => { const n = __trains.cfg(2).speed; __trains.setSpeed('slow'); const s = __trains.cfg(2).speed; __trains.setSpeed('fast'); const f = __trains.cfg(2).speed;
      return { normal: n, slow: s, fast: f, phase: __trains.phase, level: __trains.level, spacingSame: Math.abs(__trains.cfg(2).speed * __trains.cfg(2).gap - n * __trains.cfg(2).gap * 1.3 / 1.3) >= 0 }; });
    summary.speed = sp;
    check('speed option: slow < normal < fast, applied mid-level without a restart', sp.slow < sp.normal && sp.normal < sp.fast && sp.phase === 'play' && sp.level === 2, sp);
    // bests are kept per difficulty, and the picker shows all three rows
    await page.evaluate(() => { localStorage.setItem('trainswitcher.v1', JSON.stringify({ bests: { kid: 7, expert: 2 } })); });
    await page.reload(); await page.waitForTimeout(200);
    const pills = await page.evaluate(() => { const out = {}; for (const d of ['kid', 'adult', 'expert']) { __trains.setDifficulty(d); out[d] = document.getElementById('bestPill').textContent; } return out; });
    summary.bests = pills;
    check('each difficulty keeps its own best', /7/.test(pills.kid) && /0/.test(pills.adult) && /2/.test(pills.expert), pills);
    await page.evaluate(() => { localStorage.setItem('trainswitcher.v1', JSON.stringify({ best: 5 })); }); await page.reload(); await page.waitForTimeout(200);
    const migrated = await page.evaluate(() => { __trains.setDifficulty('adult'); return document.getElementById('bestPill').textContent; });
    check('an old saved best shows under Adult', /5/.test(migrated), migrated);
    const rows = await page.evaluate(() => ({ themes: document.querySelectorAll('#startOv .picker .pick').length, diffs: document.querySelectorAll('#startOv .dpicker:not(.spicker) .pick').length, speeds: document.querySelectorAll('#startOv .spicker .pick').length }));
    check('start card has theme, difficulty and speed pickers', rows.themes === 3 && rows.diffs === 3 && rows.speeds === 3, rows);
    await ctx.close();
  }

  await Promise.all([...REQUIRED.map(playTheme), phone('360x640', '360x640', true), phone('iPhone SE', 'iphone-se', true), tapZone(), crashRule()]);
  check('no console errors', !errs.length, errs);
  const result = { ...summary, checks: { passed, failed }, errs, screenshots: SHOT, ok: !failed.length && !errs.length };
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
  process.exit(result.ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
