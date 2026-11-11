// Plays the second batch of prototypes end to end in a headless iPhone-sized browser and reports console errors.
// Run: node tools/smoke-test-2.js [game ...]   (needs Playwright + Chromium). Screenshots land in the temp dir.
const { chromium, devices } = require('playwright');
const path = require('path');
const R = path.join(__dirname, '..', 'games') + '/';
const SHOT = require('os').tmpdir() + '/';
const only = process.argv.slice(2);
const want = n => !only.length || only.includes(n);

(async () => {
  const browser = await chromium.launch();
  const results = {};
  async function open(file, ctxOpts = {}) {
    const ctx = await browser.newContext({ ...devices['iPhone 13'], ...ctxOpts });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await page.goto('file://' + R + file);
    return { page, errs, ctx };
  }

  // ---------- Math Ring ----------
  if (want('math-ring')) {
    const { page, errs, ctx } = await open('math-ring/math-ring.html');
    const G = expr => page.evaluate(expr);
    await page.screenshot({ path: SHOT + 'mr-start.png' });
    await page.click('#startBtn');
    const tapAnswer = async correct => {
      const ans = await G('__mathRing.ans');
      const vals = await page.$$eval('.ans', bs => bs.map(b => +b.textContent));
      const idx = correct ? vals.indexOf(ans) : vals.findIndex(v => v !== ans);
      if (idx < 0) throw new Error('correct answer missing ' + ans + ' ' + vals);
      await page.locator('.ans').nth(idx).dispatchEvent('pointerdown');
    };
    const t0 = await G('__mathRing.time');
    for (let i = 0; i < 18; i++) await tapAnswer(true);
    const t1 = await G('__mathRing.time');
    const qLate = await page.textContent('#q');
    await page.screenshot({ path: SHOT + 'mr-play.png' });
    await tapAnswer(false);
    const t2 = await G('__mathRing.time');
    await page.waitForTimeout(600);
    // run out of time -> ring
    await G('__mathRing.time = 0.05');
    await page.waitForFunction(() => __mathRing.phase === 'ring');
    await page.mouse.click(195, 400); // instant tap should be ignored (get-ready delay)
    await page.waitForFunction(() => Math.abs(__mathRing.ringR - __mathRing.ringTarget) < __mathRing.ringWindow * 0.5, null, { polling: 'raf' });
    await page.mouse.click(195, 400);
    await page.waitForTimeout(200);
    await page.screenshot({ path: SHOT + 'mr-ring-hit.png' });
    await page.waitForFunction(() => __mathRing.phase === 'quiz', null, { timeout: 4000 });
    const afterRing = await G('__mathRing.time');
    // out of time again -> ring is used, so ad offer
    await G('__mathRing.time = 0.05');
    await page.waitForSelector('#offerOv.show');
    await page.screenshot({ path: SHOT + 'mr-offer.png' });
    await page.click('#adBtn');
    await page.waitForTimeout(500);
    await page.screenshot({ path: SHOT + 'mr-ad.png' });
    await page.waitForFunction(() => __mathRing.phase === 'quiz', null, { timeout: 8000 });
    const afterAd = await G('__mathRing.time');
    // out of time a third time -> straight to game over
    await G('__mathRing.time = 0.05');
    await page.waitForSelector('#overOv.show');
    await page.waitForTimeout(400);
    await page.screenshot({ path: SHOT + 'mr-over.png' });
    const over1 = { score: await page.textContent('#oScore'), newBest: await page.textContent('#oNew'), best: await page.textContent('#oBest'), saves: await page.textContent('#oSaves') };
    // second run: miss the ring, decline ad
    await page.click('#againBtn');
    await G('__mathRing.time = 0.05');
    await page.waitForFunction(() => __mathRing.phase === 'ring');
    await page.waitForTimeout(1100); // past the delay, ring still far out -> early tap = miss
    await page.mouse.click(195, 400);
    await page.waitForSelector('#offerOv.show', { timeout: 4000 });
    await page.click('#noAdBtn');
    await page.waitForSelector('#overOv.show');
    const over2 = { score: await page.textContent('#oScore'), best: await page.textContent('#oBest') };
    await page.reload();
    const pillAfterReload = await page.textContent('#bestPill');
    results.mathRing = { startTime: t0, timeAfter18Right: +t1.toFixed(1), lateQuestion: qLate, timeAfterWrong: +t2.toFixed(1),
      timeAfterRingHit: +afterRing.toFixed(1), timeAfterAd: +afterAd.toFixed(1), over1, over2, pillAfterReload, errs };
    await ctx.close();
  }

  // ---------- Tower Drop ----------
  if (want('tower-drop')) {
    const { page, errs, ctx } = await open('tower-drop/tower-drop.html');
    const G = expr => page.evaluate(expr);
    await page.screenshot({ path: SHOT + 'td-start.png' });
    await page.click('#startBtn');
    const dropAt = async (target, tol) => {
      await page.waitForFunction(([t, tol]) => !__tower.dropping && Math.abs(__tower.offset - t) < tol, [target, tol], { polling: 'raf', timeout: 15000 });
      await page.mouse.click(195, 500);
      await page.waitForFunction(() => !__tower.dropping, null, { timeout: 3000 });
      await page.waitForTimeout(50);
    };
    const w0 = await G('__tower.width');
    await dropAt(30, 6);                        // sloppy: overhang cut, block shrinks
    const w1 = await G('__tower.width');
    for (let i = 0; i < 5; i++) await dropAt(0, 3);  // perfect drops build a combo
    const combo = await G('__tower.combo'); const w2 = await G('__tower.width');
    await page.screenshot({ path: SHOT + 'td-play.png' });
    // a full miss ends the game
    // keep making very sloppy drops: the block shrinks each time until one misses the tower
    let sloppy = 0;
    while (await G('__tower.phase') === 'play' && sloppy < 25) {
      await page.waitForFunction(() => !__tower.dropping && Math.abs(__tower.offset) > __tower.width * 0.8, null, { polling: 'raf', timeout: 15000 });
      await page.mouse.click(195, 500); sloppy++;
      await page.waitForFunction(() => !__tower.dropping || __tower.phase === 'over', null, { timeout: 3000 });
      await page.waitForTimeout(50);
    }
    await page.waitForSelector('#overOv.show', { timeout: 3000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: SHOT + 'td-over.png' });
    results.towerDrop = { startWidth: Math.round(w0), widthAfterSloppy: Math.round(w1), comboAfter5Perfect: combo, widthAfterCombo: Math.round(w2),
      floors: await page.textContent('#oScore'), newBest: await page.textContent('#oNew'), best: await page.textContent('#oBest'), errs };
    await ctx.close();
  }

  // ---------- Train Switcher ----------
  if (want('train-switcher')) {
    const { page, errs, ctx } = await open('train-switcher/train-switcher.html');
    const snap = () => page.evaluate(() => __trains.snapshot());
    await page.screenshot({ path: SHOT + 'ts-start.png' });
    await page.click('#startBtn');
    // bot: point each switch at the branch the next approaching train needs
    const playLevel = async () => {
      for (let i = 0; i < 1200; i++) {
        const ph = await page.evaluate(() => __trains.phase); if (ph !== 'play') return ph;
        const s = await snap();
        for (const sw of s.switches) {
          const next = s.trains.filter(t => t.at === sw.id).sort((a, b) => a.d - b.d)[0];
          if (!next) continue;
          const want = s.routes[sw.id][next.colour];
          if (want !== sw.state && !sw.busy) await page.mouse.click(sw.x, sw.y);
        }
        await page.waitForTimeout(40);
      }
      return 'timeout';
    };
    const levels = [];
    for (let L = 1; L <= 4; L++) {
      const r = await playLevel(); levels.push(r);
      if (L === 2) await page.screenshot({ path: SHOT + 'ts-win.png' });
      if (r !== 'win') break;
      await page.waitForSelector('#winOv.show');
      await page.click('#nextBtn');
      await page.waitForTimeout(300);
      if (L === 3) await page.waitForTimeout(3000), await page.screenshot({ path: SHOT + 'ts-play.png' });
    }
    // force a crash: flip a switch while a train is on it
    let crashed = false;
    for (let i = 0; i < 400 && !crashed; i++) {
      const s = await snap(); const busy = s.switches.find(w => w.busy);
      if (busy) { await page.mouse.click(busy.x, busy.y); crashed = true; } else await page.waitForTimeout(30);
    }
    await page.waitForSelector('#failOv.show', { timeout: 4000 });
    await page.screenshot({ path: SHOT + 'ts-crash.png' });
    const crashTitle = await page.textContent('#failTitle');
    // wrong station: leave switches pointing the wrong way
    await page.click('#retryBtn');
    let wrongOk = false;
    for (let i = 0; i < 600; i++) {
      const ph = await page.evaluate(() => __trains.phase); if (ph !== 'play') break;
      const s = await snap();
      for (const sw of s.switches) {
        const next = s.trains.filter(t => t.at === sw.id).sort((a, b) => a.d - b.d)[0];
        if (next && s.routes[sw.id][next.colour] === sw.state && !sw.busy) await page.mouse.click(sw.x, sw.y);
      }
      await page.waitForTimeout(40);
    }
    await page.waitForSelector('#failOv.show', { timeout: 4000 });
    const wrongTitle = await page.textContent('#failTitle');
    results.trainSwitcher = { levels, crashTitle, wrongTitle, bestPill: await page.textContent('#bestPill'), errs };
    await ctx.close();
  }

  // ---------- Merge a City ----------
  if (want('merge-city')) {
    const { page, errs, ctx } = await open('merge-city/merge-city.html');
    const G = expr => page.evaluate(expr);
    await page.screenshot({ path: SHOT + 'mc-start.png' });
    await page.click('#startBtn');
    const dragCells = async (a, b) => {
      const A = await G(`__city.centre(${a})`), B = await G(`__city.centre(${b})`);
      await page.mouse.move(A.x, A.y); await page.mouse.down();
      await page.mouse.move(B.x, B.y, { steps: 6 }); await page.mouse.up();
    };
    let merges = 0, maxLv = 0, tapMerge = false, shot = false;
    const t0 = Date.now();
    while (Date.now() - t0 < 40000 && maxLv < 3) {
      const g = await G('__city.grid');
      let done = false;
      for (let lv = 3; lv >= 0 && !done; lv--) {
        const idx = g.map((v, i) => v === lv ? i : -1).filter(i => i >= 0);
        if (idx.length >= 2) {
          if (!tapMerge && lv === 0) { // tap-tap merge once
            const A = await G(`__city.centre(${idx[0]})`), B = await G(`__city.centre(${idx[1]})`);
            await page.mouse.click(A.x, A.y); await page.mouse.click(B.x, B.y); tapMerge = true;
          } else await dragCells(idx[0], idx[1]);
          merges++; done = true;
        }
      }
      maxLv = Math.max(maxLv, ...(await G('__city.grid')).filter(v => v != null));
      if (maxLv >= 2 && !shot) { await page.waitForTimeout(200); await page.screenshot({ path: SHOT + 'mc-play.png' }); shot = true; }
      if (!done) await page.waitForTimeout(200);
    }
    const score = await page.textContent('#score');
    // stop playing: the city fills up and the round ends
    await page.waitForSelector('#overOv.show', { timeout: 60000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: SHOT + 'mc-over.png' });
    results.mergeCity = { merges, maxLevel: maxLv, scoreWhilePlaying: score, final: await page.textContent('#oScore'),
      newBest: await page.textContent('#oNew'), tallest: await page.textContent('#oTall'), errs };
    await ctx.close();
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
