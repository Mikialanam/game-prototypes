// Smoke test for the three City Hall games (Mayor's Desk, Contract Hustle, Street Clash).
// Plays each one end to end on emulated phone screens, checks layout and console errors.
// Run: node tools/smoke-city-hall.js [mayors-desk|contract-hustle|street-clash ...]
// Needs Playwright + Chromium. Screenshots land in the temp dir (city-hall-*.png).
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
const R = 'file://' + path.join(__dirname, '..', 'games') + '/';
const SHOT = path.join(os.tmpdir(), 'city-hall-');
const only = process.argv.slice(2);
const want = n => !only.length || only.includes(n);
const PHONES = [
  { name: 'small-320x568', width: 320, height: 568 },
  { name: 'android-360x640', width: 360, height: 640 },
  { name: 'iphone-390x844', width: 390, height: 844 },
  { name: 'pixel-412x915', width: 412, height: 915 },
];
let fails = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; console.log('  FAIL ' + msg); } };

(async () => {
  const browser = await chromium.launch();
  async function open(file, phone) {
    const ctx = await browser.newContext({ viewport: { width: phone.width, height: phone.height }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await page.goto(R + file);
    return { page, errs, ctx };
  }
  // Every visible button must be inside the screen, at least 44px tall, and the page must not scroll sideways.
  async function layout(page, label, sel = 'button') {
    const r = await page.evaluate(sel => {
      const out = { overflowX: document.documentElement.scrollWidth > innerWidth + 1, bad: [] };
      document.querySelectorAll(sel).forEach(b => {
        const s = getComputedStyle(b), rc = b.getBoundingClientRect();
        if (s.display === 'none' || s.visibility === 'hidden' || rc.width === 0 || b.closest('.overlay:not(.show)')) return;
        const inScroller = b.closest('#main, #card, .sheet, #trickList');
        if (rc.height < 44) out.bad.push(`${b.id || b.className || b.textContent.trim().slice(0, 20)} only ${Math.round(rc.height)}px tall`);
        if (!inScroller && (rc.bottom > innerHeight + 1 || rc.right > innerWidth + 1 || rc.left < -1)) out.bad.push(`${b.id || b.textContent.trim().slice(0, 20)} off screen`);
      });
      return out;
    }, sel);
    ok(!r.overflowX, `${label}: page scrolls sideways`);
    ok(!r.bad.length, `${label}: ${r.bad.join('; ')}`);
  }

  // ---------------- Mayor's Desk ----------------
  if (want('mayors-desk')) for (const phone of PHONES) {
    const L = `mayors-desk @${phone.name}`; console.log(L);
    const { page, errs, ctx } = await open('mayors-desk/mayors-desk.html', phone);
    await layout(page, L + ' start');
    await page.screenshot({ path: SHOT + `md-start-${phone.name}.png` });
    const crisisToday = await page.textContent('#todayCrisis');
    ok(crisisToday.length > 5, L + ': daily crisis shown');
    await page.click('#pA');
    await layout(page, L + ' desk');
    const cardH = await page.evaluate(() => document.getElementById('card').getBoundingClientRect().height);
    ok(cardH >= 150, `${L}: request card only ${Math.round(cardH)}px tall`);
    await page.screenshot({ path: SHOT + `md-desk-${phone.name}.png` });
    // try a dirty trick and the ad placeholder
    await page.click('#tricksBtn'); await layout(page, L + ' tricks', '.sheet button');
    await page.click('.trick[data-k="spin"]');
    ok(await page.evaluate(() => __mayor.S.tricksUsed.spin === true), L + ': trick used');
    await page.click('#creditsBtn'); await page.click('#adBtn');
    await page.waitForFunction(() => __mayor.S.adUsed && !document.getElementById('adOv').classList.contains('show'), null, { timeout: 5000 });
    let sawCrisis = false, sawNews = false, delayed = false;
    for (let i = 0; i < 40; i++) {
      if (await page.isVisible('#endOv.show')) break;
      if (await page.isVisible('#newsOv.show')) { sawNews = true; if (phone.width === 320) await layout(page, L + ' news', '#newsOk'); await page.click('#newsOk'); continue; }
      if (await page.isVisible('.opt')) { sawCrisis = true; await layout(page, L + ' crisis'); if (phone.width === 360) await page.screenshot({ path: SHOT + `md-crisis-${phone.name}.png` }); await page.locator('.opt:not([disabled])').first().click(); continue; }
      if (!delayed && await page.isEnabled('#bDelay')) { delayed = true; await page.click('#bDelay'); continue; }
      (await page.isEnabled('#bFund')) && i % 3 !== 2 ? await page.click('#bFund') : await page.click('#bReject');
    }
    await page.waitForSelector('#endOv.show', { timeout: 3000 });
    ok(sawCrisis, L + ': crisis card appeared'); ok(sawNews, L + ': a headline appeared');
    const S = await page.evaluate(() => ({ week: __mayor.S.week, done: __mayor.S.done, delayedN: __mayor.S.delayedN }));
    ok(S.done && S.week === 48 && S.delayedN === 1, L + ': term ended at week 48 ' + JSON.stringify(S));
    await layout(page, L + ' end');
    await page.screenshot({ path: SHOT + `md-end-${phone.name}.png` });
    const best = await page.evaluate(() => JSON.parse(localStorage.getItem('mayorsdesk.v1') || '{}').best);
    ok(best > 0, L + ': best score saved');
    ok(!errs.length, L + ': console errors ' + errs.join(' | '));
    await ctx.close();
  }

  // ---------------- Contract Hustle ----------------
  if (want('contract-hustle')) for (const phone of PHONES) {
    const L = `contract-hustle @${phone.name}`; console.log(L);
    const { page, errs, ctx } = await open('contract-hustle/contract-hustle.html', phone);
    await layout(page, L + ' start');
    await page.screenshot({ path: SHOT + `ch-start-${phone.name}.png` });
    await page.click('#startBtn');
    let rounds = 0, wins = 0;
    for (let r = 0; r < 12; r++) {
      if (await page.isVisible('#endOv.show')) break;
      await layout(page, L + ' move');
      const mv = r === 0 ? 'donate' : r === 1 ? 'community' : r === 2 ? 'lobby' : 'skip';
      const btn = page.locator(`.move[data-k="${mv}"]:not([disabled])`);
      await ((await btn.count()) ? btn.click() : page.click('.move[data-k="skip"]'));
      await layout(page, L + ' bid');
      if (r === 3) await page.screenshot({ path: SHOT + `ch-bid-${phone.name}.png` });
      const bid = page.locator('.bid.fair:not([disabled])');
      if ((await bid.count()) && r % 4 !== 3) await bid.first().click(); else await page.click('#passBtn');
      await layout(page, L + ' result', '#rOk');
      if (await page.textContent('#rTitle') === '🎉 Contract won') wins++;
      rounds++;
      await page.click('#rOk');
    }
    await page.waitForSelector('#endOv.show', { timeout: 3000 });
    ok(rounds === 10, `${L}: played ${rounds} rounds`);
    await layout(page, L + ' end');
    await page.screenshot({ path: SHOT + `ch-end-${phone.name}.png` });
    const v = +(await page.textContent('#endScore'));
    ok(v > 0, L + ': company value ' + v);
    // the mayor freezes you out under the frozen line
    await page.click('#againBtn');
    await page.evaluate(() => { __hustle.S.op = 10; });
    await page.click('.move[data-k="skip"]');
    ok(await page.isVisible('.frozen') && !(await page.locator('.bid').count()), L + ': frozen out at low opinion');
    ok(!errs.length, L + ': console errors ' + errs.join(' | '));
    console.log(`  won ${wins} of ${rounds} fair bids, value ${v}`);
    await ctx.close();
  }

  // ---------------- Street Clash ----------------
  if (want('street-clash')) for (const phone of PHONES) {
    const L = `street-clash @${phone.name}`; console.log(L);
    const { page, errs, ctx } = await open('street-clash/street-clash.html', phone);
    await layout(page, L + ' start');
    await page.screenshot({ path: SHOT + `sc-start-${phone.name}.png` });
    // protester: real finger drag up the street
    await page.click('#pickProt');
    await layout(page, L + ' play');
    const cv = await page.locator('#cv').boundingBox();
    const y0 = await page.evaluate(() => __clash.S.player.y);
    await page.mouse.move(cv.x + cv.width / 2, cv.y + cv.height * 0.62);
    await page.mouse.down();
    await page.mouse.move(cv.x + cv.width / 2, cv.y + 20, { steps: 8 });
    await page.waitForTimeout(700);
    await page.mouse.up();
    const y1 = await page.evaluate(() => __clash.S.player.y);
    ok(y1 < y0 - 30, `${L}: dragging moves the protester up (${Math.round(y0)} → ${Math.round(y1)})`);
    await page.locator('#actBtn').dispatchEvent('pointerdown');
    ok(await page.evaluate(() => __clash.S.cool > 0), L + ': chant starts its cooldown');
    // bot to the rally point
    for (let i = 0; i < 160; i++) {
      const done = await page.evaluate(() => {
        const S = __clash.S; if (!S.running) return true;
        const P = S.player, next = S.barriers.filter(b => !b.down && b.y < P.y - 5).sort((a, z) => z.y - a.y);
        let tx = P.x, ty = P.y - 120;
        if (next.length && P.y - next[0].y < 140) { const l = next[0]; const gx = l.x + l.w + 32; tx = gx; ty = Math.abs(P.x - gx) < 10 ? P.y - 80 : Math.max(P.y - 30, l.y + 30); }
        S.target = { x: tx, y: ty }; return false;
      });
      if (done) break;
      if (i === 12 && phone.width === 360) await page.screenshot({ path: SHOT + `sc-prot-${phone.name}.png` });
      await page.waitForTimeout(200);
    }
    const protWon = await page.isVisible('#lvlOv.show');
    ok(protWon, L + ': protester reached the rally point');
    if (protWon) {
      await layout(page, L + ' level card');
      await page.screenshot({ path: SHOT + `sc-level-${phone.name}.png` });
      await page.click('#adBtn'); await page.waitForTimeout(1700);
      await page.locator('#shop button:not([disabled])').first().click();
      ok(await page.evaluate(() => !!__clash.S.boost), L + ': bought a boost');
      await page.click('#nextBtn');
      ok(await page.evaluate(() => __clash.S.level === 2 && __clash.S.running), L + ': level 2 started');
      await page.evaluate(() => { __clash.S.time = 0.05; });
      await page.waitForSelector('#overOv.show', { timeout: 3000 });
      await layout(page, L + ' game over');
    }
    // police: gentle vs heavy-handed, same length of play
    const policeRun = async style => {
      await page.evaluate(() => { localStorage.setItem('x', '1'); });
      if (await page.isVisible('#overOv.show')) await page.click('#switchBtn');
      await page.click('#pickPol');
      for (let i = 0; i < 60; i++) {
        await page.evaluate(style => {
          const S = __clash.S; if (!S.running) return;
          const P = S.player, ms = S.marchers.filter(m => !m.leaving && m.state === 'walk').sort((a, z) => z.y - a.y), m = ms[0];
          if (!m) { S.target = null; return; }
          if (style === 'gentle') { const t = m.rowdy ? { x: m.x, y: m.y } : { x: m.x, y: m.y + 28 }; S.target = (m.rowdy || Math.hypot(P.x - t.x, P.y - t.y) > 12) ? t : null; }
          else { S.target = { x: m.x, y: m.y }; if (S.cool <= 0) document.getElementById('actBtn').dispatchEvent(new PointerEvent('pointerdown')); }
        }, style);
        if (i === 30 && style === 'gentle' && phone.width === 360) await page.screenshot({ path: SHOT + `sc-police-${phone.name}.png` });
        await page.waitForTimeout(200);
      }
      const r = await page.evaluate(() => ({ op: Math.round(__clash.S.op), tackles: __clash.S.tackles, escorts: __clash.S.escorts, cleared: __clash.S.cleared }));
      await page.evaluate(() => { __clash.S.op = 0; });
      await page.waitForSelector('#overOv.show', { timeout: 3000 });
      return r;
    };
    const gentle = await policeRun('gentle');
    const rough = await policeRun('rough');
    console.log(`  police gentle ${JSON.stringify(gentle)} · rough ${JSON.stringify(rough)}`);
    ok(gentle.op > rough.op, `${L}: going in hard costs more opinion (gentle ${gentle.op} vs rough ${rough.op})`);
    ok(gentle.escorts > 0 && rough.tackles > gentle.tackles, L + ': escorts and tackles both happen');
    await page.screenshot({ path: SHOT + `sc-over-${phone.name}.png` });
    const best = await page.evaluate(() => JSON.parse(localStorage.getItem('streetclash.v1') || '{}'));
    ok(best.bestProt > 0 || best.bestPol > 0, L + ': best saved ' + JSON.stringify(best));
    ok(!errs.length, L + ': console errors ' + errs.join(' | '));
    await ctx.close();
  }

  await browser.close();
  console.log(`\n${checks - fails}/${checks} checks passed. Screenshots: ${SHOT}*.png`);
  process.exit(fails ? 1 : 0);
})();
