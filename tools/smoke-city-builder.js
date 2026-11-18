// Plays City Builder on emulated phones: merging, rent, tenants, deals, jobs, away, the hidden settings screen,
// and every one of the 64 combinations of feature switches. Prints a JSON summary; exits non-zero if a check fails
// or the page logs an error. Run: node tools/smoke-city-builder.js   Screenshots land in $SHOT_DIR (default: temp dir).
const { chromium, devices } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const URL = 'file://' + path.join(__dirname, '..', 'games', 'city-builder', 'city-builder.html');
const SHOT = path.resolve(process.env.SHOT_DIR || path.join(os.tmpdir(), 'city-builder-shots')) + path.sep;
const KEYS = ['merging', 'renting', 'tenants', 'deals', 'jobs', 'away'];
const PHONES = {
  '360x640': { viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true },
  'iPhone SE': { ...devices['iPhone SE'] },
  'iPhone 13': { ...devices['iPhone 13'] },
  '390x844': { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
};

(async () => {
  fs.mkdirSync(SHOT, { recursive: true });
  const browser = await chromium.launch();
  const errs = [], failed = []; let passed = 0; const summary = {};
  const check = (name, ok, detail) => { if (ok) passed++; else failed.push(detail === undefined ? name : `${name} ${JSON.stringify(detail)}`); return ok; };
  async function open(phone, query = '') {
    const ctx = await browser.newContext(PHONES[phone]); const page = await ctx.newPage();
    page.on('pageerror', e => errs.push(`${phone}${query}: pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errs.push(`${phone}${query}: console: ${m.text()}`); });
    await page.goto(URL + query); await page.waitForTimeout(250);
    return { page, ctx };
  }
  const S = page => page.evaluate(() => __cb.state);
  const drag = async (page, a, b) => { const A = await page.evaluate(i => __cb.centre(i), a), B = await page.evaluate(i => __cb.centre(i), b);
    await page.mouse.move(A.x, A.y); await page.mouse.down(); await page.mouse.move(B.x, B.y, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(60); };
  const tap = async (page, i) => { const A = await page.evaluate(i => __cb.centre(i), i); await page.mouse.click(A.x, A.y); await page.waitForTimeout(80); };
  const tapPlace = async (page, id) => { const A = await page.evaluate(id => __cb.place(id), id); await page.mouse.click(A.x, A.y); await page.waitForTimeout(120); };
  const clickAct = async (page, act, arg) => { await page.click(`#sheet [data-act="${act}"]${arg != null ? `[data-arg="${arg}"]` : ''}`); await page.waitForTimeout(120); };
  // merge any matching pair with a real drag; returns true if one was made
  async function mergeOnce(page) {
    const s = await S(page);
    for (let lv = 7; lv >= 0; lv--) { const idx = s.lots.map((l, i) => l.b && l.b.lv === lv ? i : -1).filter(i => i >= 0);
      if (idx.length >= 2) { await drag(page, idx[0], idx[1]); return true; } }
    return false;
  }

  // ---------- 1. layout on four phone sizes ----------
  summary.layout = {};
  for (const phone of process.env.QUICK ? [] : Object.keys(PHONES)) {
    const { page, ctx } = await open(phone);
    const m = await page.evaluate(() => { const r = id => document.getElementById(id).getBoundingClientRect();
      const lot = document.querySelector('.lot').getBoundingClientRect(), places = [...document.querySelectorAll('.place')].map(p => p.getBoundingClientRect());
      return { w: innerWidth, h: innerHeight, scrollW: document.documentElement.scrollWidth, lot: Math.round(lot.width), mapBottom: Math.round(r('map').bottom), mapRight: Math.round(r('map').right),
        streetTop: Math.round(r('street').top), streetBottom: Math.round(r('street').bottom), placeH: Math.round(Math.min(...places.map(p => p.height))), placeW: Math.round(Math.min(...places.map(p => p.width))) }; });
    summary.layout[phone] = m;
    check(`${phone}: no sideways scroll`, m.scrollW <= m.w, m);
    check(`${phone}: map fits above the street`, m.mapBottom <= m.streetTop && m.mapRight <= m.w, m);
    check(`${phone}: street on screen`, m.streetBottom <= m.h + 1, m);
    check(`${phone}: lots big enough to drag (>=44px)`, m.lot >= 44, m);
    check(`${phone}: street buttons >=48px`, m.placeH >= 48 && m.placeW >= 48, m);
    await page.screenshot({ path: SHOT + `cb-${phone.replace(/ /g, '')}-start.png` });
    await ctx.close();
  }

  // ---------- 2. a full session with everything on (iPhone 13) ----------
  {
    const { page, ctx } = await open('iPhone 13');
    await page.evaluate(() => { __cb.clearFlags(); __cb.seed(42); });
    const s0 = await S(page);
    check('starts with 4 houses and an apartment', s0.lots.filter(l => l.b && l.b.lv === 0).length === 4 && s0.lots.filter(l => l.b && l.b.lv === 1).length === 1);
    check('20 open lots, 10 for sale', s0.lots.filter(l => l.open).length === 20);
    await drag(page, 6, 7); await page.waitForTimeout(450);
    let s = await S(page);
    check('first drag merges and chains into a tower', s.lots[7].b && s.lots[7].b.lv === 2 && !s.lots[8].b && !s.lots[6].b, s.lots.slice(5, 10));
    check('merge bonus paid', s.coins > s0.coins, [s0.coins, s.coins]);
    // tap-tap merge
    await page.evaluate(() => __cb.advance(7)); s = await S(page);
    const houses = s.lots.map((l, i) => l.b && l.b.lv === 0 ? i : -1).filter(i => i >= 0);
    await tap(page, houses[0]); await tap(page, houses[1]); s = await S(page);
    check('tap one house then another merges them', s.lots[houses[1]].b && s.lots[houses[1]].b.lv >= 1 && !s.lots[houses[0]].b);
    // drag onto a different building swaps
    s = await S(page); const h = s.lots.findIndex(l => l.b && l.b.lv === 0), t = s.lots.findIndex(l => l.b && l.b.lv === 2);
    if (h >= 0 && t >= 0) { await drag(page, h, t); s = await S(page); check('dragging onto a different building swaps them', s.lots[h].b.lv === 2 && s.lots[t].b.lv === 0); }
    // tenant: fill fast or check references
    await page.evaluate(() => __cb.advance(8)); s = await S(page);
    check('an applicant arrives while an apartment is empty', s.applicants.length > 0 || s.lots.some(l => l.b && l.b.lv >= 1 && l.b.tenant), s.applicants);
    await page.screenshot({ path: SHOT + 'cb-play.png' });
    // make sure there is a vacancy and an applicant, then check references
    await page.evaluate(() => { const s = __cb.state; const i = s.lots.findIndex(l => l.b && l.b.lv >= 1 && l.b.tenant); if (i >= 0) __cb.dispatch({ type: 'evict', lot: i }); });
    for (let k = 0; k < 40 && !(await S(page)).applicants.length; k++) await page.evaluate(() => __cb.advance(1));
    await tapPlace(page, 'bus'); await page.screenshot({ path: SHOT + 'cb-bus.png' });
    check('bus stop opens its sheet', await page.evaluate(() => __cb.sheet) === 'bus');
    if (await page.$('#sheet [data-act="tenant"][data-arg="0:check"]')) {
      await clickAct(page, 'tenant', '0:check'); await page.evaluate(() => __cb.advance(16));
      await page.screenshot({ path: SHOT + 'cb-checked.png' });
      const stars = await page.textContent('#sheetBody');
      check('checked references show stars', /★/.test(stars), stars.slice(0, 120));
      await clickAct(page, 'tenant', '0:now'); s = await S(page);
      check('checked tenant moves in and is known', s.lots.some(l => l.b && l.b.tenant && l.b.tenant.known));
    } else check('applicant offered at the bus stop', false, await page.textContent('#sheetBody'));
    await page.click('#sheet .x').catch(() => {});
    // rent piles and collecting
    await page.evaluate(() => __cb.advance(30)); s = await S(page);
    const pileLot = s.lots.findIndex(l => l.b && l.b.pile >= 1);
    check('rent piles up on buildings', pileLot >= 0);
    const before = s.coins; await tap(page, pileLot); s = await S(page);
    check('tapping a pile collects it', s.coins > before, [before, s.coins]);
    // damage and repair
    await page.evaluate(() => { const s = __cb.state; const i = s.lots.findIndex(l => l.b && l.b.lv >= 1); __cb.dispatch({ type: 'evict', lot: i }); });
    await page.evaluate(() => { __cb.advance(20); });
    let bad = await page.evaluate(() => { const s = __cb.state; return s.lots.findIndex(l => l.b && l.b.tenant && l.b.tenant.q === 'bad'); });
    for (let k = 0; k < 20 && bad < 0; k++) { // keep evicting good tenants until a trouble tenant moves in (seeded, so it's quick)
      await page.evaluate(() => { const s = __cb.state; s.lots.forEach((l, i) => { if (l.b && l.b.tenant && l.b.tenant.q !== 'bad') __cb.dispatch({ type: 'evict', lot: i }); }); __cb.advance(26); });
      bad = await page.evaluate(() => { const s = __cb.state; return s.lots.findIndex(l => l.b && l.b.tenant && l.b.tenant.q === 'bad'); });
    }
    check('a trouble tenant turns up', bad >= 0);
    if (bad >= 0) {
      await page.evaluate(() => __cb.advance(160)); s = await S(page);
      const dmg = s.lots.findIndex(l => l.b && l.b.dmg);
      check('trouble tenants damage the place', dmg >= 0);
      if (dmg >= 0) { await page.evaluate(() => __cb.give(2000)); s = await S(page);
        if (s.lots[dmg].b.pile >= 1) await tap(page, dmg);
        await tap(page, dmg); await page.screenshot({ path: SHOT + 'cb-damage.png' });
        await clickAct(page, 'repair', dmg); s = await S(page); check('repair fixes it', !s.lots[dmg].b.dmg); }
      await page.click('#sheet .x').catch(() => {});
    }
    // deals: haggle for land
    await page.evaluate(() => __cb.give(500));
    s = await S(page); const sale = s.lots.findIndex(l => !l.open); const price = await page.evaluate(() => __cb.landPrice());
    await tap(page, sale); await clickAct(page, 'haggleLand', sale);
    await page.screenshot({ path: SHOT + 'cb-haggle.png' });
    await clickAct(page, 'dealPush', 0.08);
    s = await S(page); const pushed = s.deal ? s.deal.price : null;
    check('a small push either lowers the price or costs patience', s.deal && (s.deal.price < price || s.deal.dots < s.deal.maxDots), s.deal);
    const c1 = s.coins; await clickAct(page, 'dealAccept'); s = await S(page);
    check('buying land opens the lot', s.lots[sale].open && s.coins < c1 && c1 - s.coins <= price, [c1, s.coins, price, pushed]);
    // walk-away: push hard until they leave
    s = await S(page); const sale2 = s.lots.findIndex(l => !l.open);
    await tap(page, sale2); await clickAct(page, 'haggleLand', sale2);
    for (let k = 0; k < 8 && (await S(page)).deal; k++) await clickAct(page, 'dealPush', 0.2);
    s = await S(page); check('pushing too hard makes them walk away', !s.deal && !s.lots[sale2].open);
    // market seller and buyer
    for (let k = 0; k < 6; k++) await mergeOnce(page);
    await page.evaluate(() => { __cb.openSettings(); }); await page.click('[data-tool="seller"]'); await page.click('[data-tool="close"]');
    await tapPlace(page, 'market'); s = await S(page); check('market opens a haggle', s.deal && s.deal.kind === 'market');
    await clickAct(page, 'dealAccept'); s = await S(page); check('bought a building at the market', !s.deal && !s.market.offer);
    await page.evaluate(() => { __cb.give(0); }); await page.evaluate(() => __cb.openSettings()); await page.click('[data-tool="buyer"]'); await page.click('[data-tool="close"]');
    s = await S(page); check('a buyer appears', !!s.buyer);
    if (s.buyer) { const bl = s.buyer.lot; if (s.lots[bl].b.pile >= 1) await tap(page, bl); await tap(page, bl); await clickAct(page, 'haggleSell');
      await clickAct(page, 'dealPush', 0.08); s = await S(page); const c2 = s.coins;
      if (s.deal) { await clickAct(page, 'dealAccept'); s = await S(page); check('selling to a buyer pays and frees the lot', !s.lots[bl].b && s.coins > c2); }
      else check('buyer still there after one small push', false); }
    // jobs and skills
    await tapPlace(page, 'work'); await page.evaluate(() => __cb.advance(21)); s = await S(page);
    check('a shift earns a wage', s.job.wage > 0);
    const c3 = s.coins; await tapPlace(page, 'work'); s = await S(page); check('tapping Work collects the wage', s.coins > c3);
    const inc0 = await page.evaluate(() => __cb.income());
    await tapPlace(page, 'school'); await page.screenshot({ path: SHOT + 'cb-school.png' });
    await page.click('#sheet [data-act="study"][data-arg="landlord"]'); await page.evaluate(() => __cb.advance(21)); s = await S(page);
    check('a class levels up a skill', s.skills.landlord === 1);
    check('Landlord skill raises income', (await page.evaluate(() => __cb.income())) > inc0);
    await page.click('#sheet .x').catch(() => {});
    // Town Hall grant
    await page.evaluate(() => __cb.advance(21)); const c4 = (await S(page)).coins; await tapPlace(page, 'hall');
    check('Town Hall grant collects', (await S(page)).coins > c4);
    // full map: no game over, houses wait on the road
    await page.evaluate(() => __cb.setFlags({ tenants: false }));
    await page.evaluate(() => __cb.advance(120)); s = await S(page);
    check('a full map jams instead of ending', s.queue > 0 && s.lots.filter(l => l.open && !l.b).length === 0, { queue: s.queue });
    await page.screenshot({ path: SHOT + 'cb-jam.png' });
    await mergeOnce(page); await page.evaluate(() => __cb.advance(1)); s = await S(page);
    check('merging frees room for a waiting house', s.queue < 3 || s.lots.filter(l => l.open && !l.b).length === 0);
    await page.evaluate(() => __cb.setFlags({ tenants: true }));
    // away: leave for 2 hours, reload
    const incAway = await page.evaluate(() => __cb.income());
    await page.evaluate(() => __cb.leave(7200)); await page.reload(); await page.waitForTimeout(300);
    const wtext = await page.textContent('#welcome'); s = await S(page);
    const pileSum = s.lots.reduce((a, l) => a + (l.b ? l.b.pile : 0), 0);
    check('welcome-back strip shows', await page.isVisible('#welcome.show'), wtext);
    check('away rent fills the piles (about half of 2 hours of rent)', pileSum > incAway * 120 * 0.3 && pileSum < incAway * 120 * 0.75, { pileSum: Math.round(pileSum), incAway });
    await page.screenshot({ path: SHOT + 'cb-away.png' });
    const c5 = s.coins; const anyPile = s.lots.findIndex(l => l.b && l.b.pile >= 1); await tap(page, anyPile); s = await S(page);
    check('one tap collects every sack', s.coins - c5 >= pileSum * 0.95 && !(await page.isVisible('#welcome.show')), [c5, s.coins, Math.round(pileSum)]);
    // short reload: no welcome
    await page.reload(); await page.waitForTimeout(300);
    check('no welcome after a quick reload', !(await page.isVisible('#welcome.show')));
    summary.fullSession = { coins: Math.round((await S(page)).coins), tallest: (await S(page)).tallest };
    await ctx.close();
  }

  // ---------- 3. hidden settings: hold the coin counter, and #settings ----------
  {
    const { page, ctx } = await open('360x640');
    await page.evaluate(() => __cb.clearFlags());
    const r = await page.locator('#coins').boundingBox();
    await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await page.mouse.down(); await page.waitForTimeout(700); await page.mouse.up();
    check('a short press does not open settings', !(await page.isVisible('#setOv.show')));
    await page.mouse.down(); await page.waitForTimeout(2200); await page.mouse.up();
    check('holding the coin counter 2s opens settings', await page.isVisible('#setOv.show'));
    await page.screenshot({ path: SHOT + 'cb-settings.png' });
    await page.click('[data-flag="deals"]'); await page.click('[data-flag="jobs"]');
    let f = await page.evaluate(() => __cb.flags); check('toggles switch features off', !f.deals && !f.jobs);
    await page.click('[data-tool="close"]'); await page.reload(); await page.waitForTimeout(200);
    f = await page.evaluate(() => __cb.flags); check('settings survive a reload', !f.deals && !f.jobs);
    const trees = await page.$$eval('.place.tree', els => els.length); check('off features show trees on Main Street', trees === 3, trees);
    await page.evaluate(() => __cb.openSettings()); await page.click('[data-tool="defaults"]'); f = await page.evaluate(() => __cb.flags);
    check('defaults restore every feature', ['merging', 'renting', 'tenants', 'deals', 'jobs', 'away'].every(k => f[k]), f);
    await ctx.close();
    const o = await open('360x640', '#settings'); check('#settings opens the settings screen', await o.page.isVisible('#setOv.show')); await o.ctx.close();
  }

  // ---------- 4. every combination of switches (64), via ?flags= ----------
  summary.combos = { played: 0, stuck: [] };
  if (!process.env.QUICK) {
    const ctx = await browser.newContext(PHONES['360x640']); const page = await ctx.newPage();
    page.on('pageerror', e => errs.push(`combo: pageerror: ${e.message}`)); page.on('console', m => { if (m.type() === 'error') errs.push(`combo: console: ${m.text()}`); });
    for (let n = 0; n < 64; n++) {
      const bits = n.toString(2).padStart(6, '0'), want = Object.fromEntries(KEYS.map((k, i) => [k, bits[i] === '1']));
      await page.goto(URL + '?flags=' + bits); await page.evaluate(() => __cb.resetCity()); await page.waitForTimeout(60);
      const f = await page.evaluate(() => __cb.flags);
      check(`${bits}: flags applied`, KEYS.every(k => f[k] === (k === 'tenants' ? want.tenants && want.renting : want[k])), f);
      // UI for off features must be gone
      const ui = await page.evaluate(() => ({ trees: [...document.querySelectorAll('.place')].map(p => p.classList.contains('tree')), rate: document.getElementById('rate').textContent,
        letSigns: document.querySelectorAll('.let').length, plus: document.querySelectorAll('.plus').length }));
      const expectTrees = [!f.tenants, !f.jobs, !f.jobs, !f.deals, false];
      check(`${bits}: Main Street matches the switches`, JSON.stringify(ui.trees) === JSON.stringify(expectTrees), ui.trees);
      if (!f.tenants) check(`${bits}: no TO LET signs`, ui.letSigns === 0);
      if (!f.renting) check(`${bits}: no rent shown`, !/min/.test(ui.rate), ui.rate);
      if (f.merging) check(`${bits}: no build buttons while merging`, ui.plus === 0);
      // play ~3 minutes like a simple player: merge or build/upgrade, collect everything, buy land
      const s0 = await S(page);
      for (let k = 0; k < 36; k++) {
        await page.evaluate(({ merging }) => {
          const s = __cb.state, d = a => __cb.dispatch(a);
          if (merging) { for (let lv = 7; lv >= 0; lv--) { const idx = s.lots.map((l, i) => l.b && l.b.lv === lv ? i : -1).filter(i => i >= 0); if (idx.length >= 2) { d({ type: 'drop', lot: idx[0], to: idx[1] }); break; } } }
          else { const e = s.lots.findIndex(l => l.open && !l.b); const u = s.lots.map((l, i) => l.b ? i : -1).filter(i => i >= 0).sort((a, b) => s.lots[a].b.lv - s.lots[b].b.lv)[0];
            if (e >= 0 && s.lots.filter(l => l.b).length < 6) d({ type: 'build', lot: e }); else if (u != null) d({ type: 'upgrade', lot: u }); }
          d({ type: 'collectAll' }); d({ type: 'grant' }); d({ type: 'work' });
          if (s.applicants.length) d({ type: 'tenant', i: 0, choice: 'now' });
          const sale = __cb.state.lots.findIndex(l => !l.open);
          if (sale >= 0 && __cb.state.coins > __cb.landPrice() * 1.2) { if (__cb.flags.deals) { d({ type: 'dealOpen', kind: 'land', lot: sale }); d({ type: 'dealAccept' }); } else d({ type: 'buyLand', lot: sale }); }
          __cb.advance(5);
        }, { merging: f.merging });
      }
      const s1 = await S(page);
      const worth = s => s.coins + s.lots.reduce((a, l) => a + (l.b ? [30, 75, 190, 470, 1170, 2900, 7300, 18000][l.b.lv] : 0) + (l.open ? 0 : 0), 0) + s.landBought * 100;
      const grew = worth(s1) > worth(s0) * 1.2 && (s1.tallest > s0.tallest || s1.landBought > 0 || s1.coins > s0.coins + 100);
      if (!check(`${bits}: the city grows (no dead end)`, grew, { before: worth(s0), after: worth(s1), tallest: s1.tallest, land: s1.landBought, coins: Math.round(s1.coins) })) summary.combos.stuck.push(bits);
      if (n === 0) await page.screenshot({ path: SHOT + 'cb-all-off.png' });
      if (bits === '011111') await page.screenshot({ path: SHOT + 'cb-merging-off.png' });
      summary.combos.played++;
    }
    await ctx.close();
  }

  summary.checks = { passed, failed }; summary.errs = errs; summary.screenshots = SHOT; summary.ok = !failed.length && !errs.length;
  console.log(JSON.stringify(summary, null, 2));
  await browser.close();
  process.exit(summary.ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
