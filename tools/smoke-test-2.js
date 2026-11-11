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

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
