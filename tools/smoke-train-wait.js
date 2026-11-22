// Checks Train Switcher's Kid mode "wait at every switch" rule on emulated phones: a vehicle stops in front of each switch and waits
// (no timer, no fail) until the player picks a way; the waiting switch glows and shows two big arrows; tapping an arrow, the track,
// the lever or the arrow button on the side you want sets the switch and lets the vehicle go; vehicles behind queue up; a wrong pick
// still goes to the wrong station; Adult and Expert do not wait. Run: node tools/smoke-train-wait.js   (needs Playwright + Chromium).
// Prints a JSON summary; exits non-zero if a check fails or the page logs an error. Screenshots land in $SHOT_DIR, or in
// <temp dir>/train-switcher-shots.
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
  const summary = { waits: {}, picks: {}, layout: {}, others: {}, bot: {} };
  const check = (name, ok, detail) => { if (ok) passed++; else failed.push(detail === undefined ? name : `${name} (${JSON.stringify(detail)})`); return ok; };

  let openCount = 0;
  // a fresh page with no first-time tutorial, the given difficulty and controls
  async function open(phone, { difficulty = 'kid', controls = 'rail', theme = 'trains' } = {}) {
    const ctx = await browser.newContext(PHONES[phone]); const page = await ctx.newPage();
    page.on('pageerror', e => errs.push(`${phone}: pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errs.push(`${phone}: console: ${m.text()}`); });
    const host = `http://tsw-wait-${++openCount}.local/`;   // own address per browser, so saved data can't leak between tests
    await ctx.route(host + '**', route => route.fulfill({ path: FILE, contentType: 'text/html; charset=utf-8' }));
    await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', 1);
      localStorage.setItem('trainswitcher.v1', JSON.stringify({ hints: { rail: true, lever: true, arrow: true } })); } });
    await page.goto(host + 'train-switcher.html');
    await page.evaluate(o => { __trains.setDifficulty(o.difficulty); __trains.setControls(o.controls); __trains.setTheme(o.theme); }, { difficulty, controls, theme });
    return { page, ctx };
  }
  const snap = page => page.evaluate(() => __trains.snapshot());
  const waiting = page => page.evaluate(() => __trains.waiting);
  const untilWaiting = (page, ms = 15000) => page.waitForFunction(() => __trains.waiting.prompt && __trains.waiting.stopped > 0, null, { timeout: ms });
  const at = (br, k) => ({ x: br.ax + (br.bx - br.ax) * k, y: br.ay + (br.by - br.ay) * k });

  // ---------- 1. Kid: the vehicle stops in front of the switch and waits as long as it takes; the switch is made obvious ----------
  async function waits(phone) {
    const { page, ctx } = await open(phone), out = summary.waits[phone] = {};
    out.startCard = await page.evaluate(() => ({ wait: !document.getElementById('ruleWait').hidden, safe: !document.getElementById('ruleSafe').hidden, text: document.getElementById('ruleWait').textContent }));
    check(`${phone}: Kid start card says vehicles wait at switches`, out.startCard.wait && !out.startCard.safe && /waits/.test(out.startCard.text), out.startCard);
    await page.evaluate(() => __trains.start(2)); await page.waitForTimeout(200);
    const sp = (await snap(page)).switches[0];
    const warm = () => page.evaluate(([x, y]) => { const c = document.getElementById('cv'), r = c.getBoundingClientRect(), k = devicePixelRatio;
      const d = c.getContext('2d').getImageData((x - r.left - 30) * k, (y - r.top - 30) * k, 1, 1).data; return d[0] + d[1] - 2 * d[2]; }, [sp.x, sp.y]);
    const glowBefore = await warm();   // yellowness of a spot just above-left of the switch, before any vehicle has arrived
    await untilWaiting(page);
    const s0 = await snap(page), w0 = await waiting(page), first = s0.trains[0], sw0 = s0.switches.find(w => w.id === w0.prompt);
    await page.screenshot({ path: SHOT + `tsw-wait-${phone.replace(/ /g, '')}.png` });
    out.first = { at: first.at, toSwitch: Math.round(first.d), prompt: w0.prompt, caption: w0.caption, switchFree: !sw0.busy };
    check(`${phone}: first vehicle stops in front of the first switch, not on it`, first.at === 's1' && w0.prompt === 's1' && first.d > 26 && !sw0.busy, out.first);
    check(`${phone}: a caption asks which way`, /which way/i.test(w0.caption), w0.caption);
    const vw = await page.evaluate(() => innerWidth);
    check(`${phone}: two big arrows (at least 44px) on screen, well apart`, w0.arrows.length === 2 && w0.arrows.every(a => a.r * 2 >= 44 && a.x - a.r >= 0 && a.x + a.r <= vw)
      && Math.hypot(w0.arrows[0].x - w0.arrows[1].x, w0.arrows[0].y - w0.arrows[1].y) >= w0.arrows[0].r * 2 + 12, w0.arrows);
    // the waiting switch really glows: the pixels just above-left of it are warm yellow now, and were not before the vehicle arrived
    out.glow = { before: glowBefore, waiting: await warm() };
    check(`${phone}: the waiting switch glows warm yellow`, out.glow.waiting > out.glow.before + 60, out.glow);
    // no timer: 8 more seconds with no input, nothing moves on, nothing fails, the next vehicles queue up behind without overlapping
    await page.waitForTimeout(8000);
    const s1 = await snap(page), ph = await page.evaluate(() => __trains.phase), lead = s1.trains[0];
    out.after8s = { phase: ph, leadMoved: Math.round(lead.pos - first.pos), trains: s1.trains.map(t => Math.round(t.pos)) };
    check(`${phone}: with no input for 8s the vehicle is still waiting and the level carries on`, ph === 'play' && Math.abs(lead.pos - first.pos) < 1 && lead.at === 's1', out.after8s);
    const gaps = s1.trains.slice(1).map((t, i) => s1.trains[i].pos - t.pos);
    check(`${phone}: vehicles behind queue up a train-length apart`, s1.trains.length >= 2 && gaps.every(g => g >= 3 * 22 - 1), { gaps });
    // pausing and resuming keeps it waiting
    await page.click('#themeBtn'); await page.waitForTimeout(600); await page.click('#themeDone'); await page.waitForTimeout(300);
    const s1b = await snap(page);
    check(`${phone}: still waiting after a pause`, Math.abs(s1b.trains[0].pos - first.pos) < 1 && (await waiting(page)).prompt === 's1');
    // tap the arrow for the way the switch is NOT set: the switch moves that way and the vehicle goes
    const want = 1 - sw0.state, a = w0.arrows[want];
    await page.touchscreen.tap(a.x, a.y); await page.waitForTimeout(900);
    const s2 = await snap(page), moved = s2.trains.find(t => t.colour === first.colour && t.pos > first.pos + 5) || null;
    out.afterTap = { state: s2.switches.find(w => w.id === 's1').state, want, movedOn: !!moved };
    check(`${phone}: tapping an arrow sets the switch that way and the vehicle moves on`, out.afterTap.state === want && out.afterTap.movedOn, out.afterTap);
    await ctx.close();
  }

  // ---------- 2. Each control mode's own move also picks the way; tapping the way it's already set just lets it go ----------
  async function picks(mode, phone) {
    const { page, ctx } = await open(phone, { controls: mode, theme: mode === 'rail' ? 'trains' : mode === 'lever' ? 'boats' : 'planes' }), out = summary.picks[`${mode} ${phone}`] = {};
    await page.evaluate(() => __trains.start(2));
    await untilWaiting(page);
    await page.screenshot({ path: SHOT + `tsw-wait-${mode}-${phone.replace(/ /g, '')}.png` });
    let s = await snap(page), w = s.switches.find(x => x.id === 's1'), lead = s.trains[0];
    // the mode's own control, on the side of the way that is not set
    const i = 1 - w.state, side = Math.sign(w.branches[i].bx - w.branches[1 - i].bx);
    if (mode === 'rail') { const p = at(w.branches[i], .6); await page.touchscreen.tap(p.x, p.y); }
    else if (mode === 'lever') await page.touchscreen.tap(w.lever.x + side * w.lever.r * .6, w.lever.y);
    else await page.touchscreen.tap(w.x + side * w.r * .55, w.y - w.r * .3);
    await page.waitForTimeout(900);
    s = await snap(page);
    out.own = { state: s.switches.find(x => x.id === 's1').state, want: i, moved: s.trains.some(t => t.colour === lead.colour && t.pos > lead.pos + 5) };
    check(`${phone}, ${mode}: the mode's own tap on the side you want sets the switch and lets the vehicle go`, out.own.state === i && out.own.moved, out.own);
    // next vehicle: tap the arrow for the way it is already set: it stays set and the vehicle goes
    await page.waitForFunction(() => { const s = __trains.snapshot(); return s.switches[0].wait && !s.switches[0].busy && __trains.waiting.stopped > 0; }, null, { timeout: 20000 });
    s = await snap(page); w = s.switches.find(x => x.id === 's1'); lead = s.trains.filter(t => t.at === 's1').sort((a, b) => a.d - b.d)[0];
    await page.touchscreen.tap(w.wait[w.state].x, w.wait[w.state].y); await page.waitForTimeout(900);
    s = await snap(page);
    out.same = { kept: s.switches.find(x => x.id === 's1').state === w.state, moved: s.trains.some(t => t.colour === lead.colour && t.pos > lead.pos + 5) };
    check(`${phone}, ${mode}: tapping the arrow it is already set to lets the vehicle go without moving the switch`, out.same.kept && out.same.moved, out.same);
    await ctx.close();
  }

  // ---------- 3. The arrows never land on a station, another switch, a lever or off screen, on every level shape ----------
  async function layout(phone) {
    const { page, ctx } = await open(phone), problems = [];
    for (const mode of MODES) for (const lv of [1, 2, 4]) {
      await page.evaluate(([m, l]) => { __trains.setControls(m); __trains.start(l); }, [mode, lv]); await page.waitForTimeout(80);
      const s = await snap(page), L = await page.evaluate(() => __trains.layout()), vw = await page.evaluate(() => innerWidth);
      s.switches.forEach(w => w.arrowSpots.forEach((a, i) => {
        const tag = `${mode} L${lv} ${w.id}/${i}`;
        if (a.x - a.r < 0 || a.x + a.r > vw || a.y - a.r < L.stage.y || a.y + a.r > L.stage.y + L.stage.h) problems.push(`${tag} off screen`);
        L.stations.forEach(st => { if (Math.abs(a.x - st.x) < a.r + st.w / 2 && a.y + a.r > st.top && a.y - a.r < st.bottom) problems.push(`${tag} on station ${st.id}`); });
        s.switches.forEach(o => { if (o.id !== w.id && Math.hypot(a.x - o.x, a.y - o.y) < a.r + (mode === 'arrow' ? o.r : 24)) problems.push(`${tag} on switch ${o.id}`);
          if (mode === 'lever' && Math.hypot(a.x - o.lever.x, a.y - o.lever.y) < a.r + o.lever.r * .8) problems.push(`${tag} on lever of ${o.id}`); });
        const other = w.arrowSpots[1 - i]; if (Math.hypot(a.x - other.x, a.y - other.y) < a.r * 2 + 8) problems.push(`${tag} touches the other arrow`);
      }));
    }
    summary.layout[phone] = problems;
    check(`${phone}: waiting arrows clear of stations, switches, levers and edges on every level shape and mode`, !problems.length, problems);
    await ctx.close();
  }

  // ---------- 4. A wrong pick still goes to the wrong station; Adult and Expert never wait ----------
  async function others() {
    let { page, ctx } = await open('iPhone 13'); const out = summary.others;
    await page.evaluate(() => __trains.start(2)); await untilWaiting(page);
    let s = await snap(page), w = s.switches[0], t = s.trains[0];
    await page.touchscreen.tap(w.wait[1 - s.routes.s1[t.colour]].x, w.wait[1 - s.routes.s1[t.colour]].y);
    // keep answering wrongly at any later switch until it reaches a station
    for (let k = 0; k < 200; k++) { const ph = await page.evaluate(() => __trains.phase); if (ph !== 'play') break;
      s = await snap(page); const lead = s.trains.find(x => x.colour === t.colour && x.at !== 's1');
      if (lead && s.routes[lead.at]) { const sw = s.switches.find(x => x.id === lead.at); if (sw.wait && !sw.busy) await page.touchscreen.tap(sw.wait[1 - s.routes[lead.at][t.colour]].x, sw.wait[1 - s.routes[lead.at][t.colour]].y); }
      await page.waitForTimeout(60); }
    await page.waitForSelector('#failOv.show', { timeout: 8000 });
    out.wrong = await page.textContent('#failTitle');
    check('Kid: picking the wrong way still sends the vehicle to the wrong station', /wrong/i.test(out.wrong), out.wrong);
    await ctx.close();
    for (const d of ['adult', 'expert']) {
      ({ page, ctx } = await open('iPhone 13', { difficulty: d }));
      const rules = await page.evaluate(() => ({ wait: !document.getElementById('ruleWait').hidden }));
      await page.evaluate(() => __trains.start(2));
      // with no input, the first vehicle rolls straight over the switch and on to a station
      let sawPrompt = false, stopped = false, prev = null, passed = false;
      for (let k = 0; k < 200 && !passed; k++) {
        const r = await page.evaluate(() => ({ w: __trains.waiting, s: __trains.snapshot(), ph: __trains.phase }));
        if (r.w.prompt || r.s.switches.some(x => x.wait)) sawPrompt = true;
        const lead = r.s.trains[0];
        if (lead && prev && lead.at === prev.at && lead.at === 's1' && Math.abs(lead.pos - prev.pos) < .01) stopped = true;
        if ((lead && lead.at !== 's1') || r.ph !== 'play') passed = true;
        prev = lead; await page.waitForTimeout(50);
      }
      out[d] = { waitRuleShown: rules.wait, sawPrompt, stopped, passed };
      check(`${d}: vehicles do not wait at switches (no prompt, no stop, rule not shown)`, !rules.wait && !sawPrompt && !stopped && passed, out[d]);
      await ctx.close();
    }
  }

  // ---------- 5. A bot that answers every waiting vehicle wins Kid levels, in every mode ----------
  async function bot(mode, phone, levels) {
    const { page, ctx } = await open(phone, { controls: mode }), out = summary.bot[`${mode} ${phone}`] = [];
    for (const L of levels) {
      await page.evaluate(l => __trains.start(l), L);
      const t0 = Date.now(); let r = 'timeout';
      while (Date.now() - t0 < 150000) {
        const ph = await page.evaluate(() => __trains.phase); if (ph !== 'play') { r = ph; break; }
        const s = await snap(page);
        for (const w of s.switches) { if (!w.wait || w.busy) continue;
          const next = s.trains.filter(t => t.at === w.id).sort((a, b) => a.d - b.d)[0]; if (!next) continue;
          const a = w.wait[s.routes[w.id][next.colour]]; await page.touchscreen.tap(a.x, a.y); await page.waitForTimeout(30); }
        await page.waitForTimeout(40);
      }
      out.push(r);
      if (!check(`${phone}, ${mode}: bot answering the waiting vehicles wins Kid level ${L}`, r === 'win', r)) break;
      await page.waitForSelector('#winOv.show');
    }
    await ctx.close();
  }

  const phones = Object.keys(PHONES);
  await Promise.all(phones.map(waits));
  await Promise.all(MODES.map(m => picks(m, m === 'lever' ? '360x640' : m === 'arrow' ? 'iPhone SE' : 'iPhone 13')));
  await Promise.all(phones.map(layout));
  await others();
  await Promise.all([bot('rail', 'iPhone SE', [1, 2, 3, 4]), bot('lever', '360x640', [2, 4]), bot('arrow', 'iPhone 13', [2, 4])]);

  await browser.close();
  console.log(JSON.stringify({ ...summary, checks: { passed, failed }, errs, screenshots: SHOT, ok: !failed.length && !errs.length }, null, 2));
  process.exit(failed.length || errs.length ? 1 : 0);
})();
