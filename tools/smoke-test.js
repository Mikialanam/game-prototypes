// Plays all three prototypes end to end in a headless iPhone-sized browser and reports console errors.
// Run: node tools/smoke-test.js   (needs Playwright + Chromium)
const { chromium, devices } = require('playwright');
const R = require('path').join(__dirname, '..', 'games') + '/';
const SHOT = require('os').tmpdir() + '/';  // screenshots land in the temp dir
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const results = {};
  async function open(name, file) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await page.goto('file://' + R + file);
    return { page, errs };
  }

  // ---- Glow Grid ----
  {
    const { page, errs } = await open('glow', 'glow-grid/glow-grid.html');
    await page.click('#closeHelp');
    await page.screenshot({ path: SHOT + 'glow-start.png' });
    // Solve via GF(2) elimination from the DOM state
    const solve = async () => {
      const on = await page.$$eval('.cell', cs => cs.map(c => c.classList.contains('on') ? 1 : 0));
      const N = 5, M = 25; const A = [];
      for (let i = 0; i < M; i++) { const row = new Array(M + 1).fill(0); const r = Math.floor(i / N), c = i % N;
        for (let j = 0; j < M; j++) { const rr = Math.floor(j / N), cc = j % N; if (Math.abs(rr - r) + Math.abs(cc - c) <= 1) row[j] = 1; }
        row[M] = on[i]; A.push(row); }
      let r = 0; const piv = [];
      for (let c = 0; c < M && r < M; c++) { let p = r; while (p < M && !A[p][c]) p++; if (p === M) continue;
        [A[r], A[p]] = [A[p], A[r]]; for (let k = 0; k < M; k++) if (k !== r && A[k][c]) for (let j = c; j <= M; j++) A[k][j] ^= A[r][j];
        piv.push(c); r++; }
      const x = new Array(M).fill(0); piv.forEach((c, i) => x[c] = A[i][M]);
      return x;
    };
    // play a wrong move, restart, then solve
    await page.locator('.cell').nth(0).click();
    const m1 = await page.textContent('#moves');
    await page.click('#resetBtn');
    const m2 = await page.textContent('#moves');
    const x = await solve();
    for (let i = 0; i < 25; i++) if (x[i]) await page.locator('.cell').nth(i).click();
    await page.waitForSelector('#resultOv.show', { timeout: 3000 });
    await page.screenshot({ path: SHOT + 'glow-result.png' });
    const streak = await page.textContent('#resStreak');
    await page.click('#prizeBtn2'); await page.waitForSelector('#prizeOv.show');
    await page.screenshot({ path: SHOT + 'glow-prize.png' });
    await page.click('#closePrize');
    // reload: should remember solved
    await page.reload(); const remembered = await page.isVisible('#resultOv.show');
    await page.click('#practiceBtn');
    const label = await page.textContent('#puzzleLabel');
    const x2 = await solve();
    for (let i = 0; i < 25; i++) if (x2[i]) await page.locator('.cell').nth(i).click();
    await page.waitForSelector('#resultOv.show', { timeout: 3000 });
    results.glow = { movesAfterTap: m1, movesAfterReset: m2, streak, rememberedAfterReload: remembered, practiceLabel: label, errs };
    await page.close();
  }

  // ---- Pulse ----
  {
    const { page, errs } = await open('pulse', 'pulse/pulse.html');
    await page.screenshot({ path: SHOT + 'pulse-start.png' });
    let hits = 0, best = 0;
    for (let attempt = 0; attempt < 6 && best === 0; attempt++) {
      await page.click(attempt === 0 ? '#playBtn' : '#againBtn');
      await page.waitForTimeout(915);
      await page.mouse.click(195, 300);
      await page.waitForTimeout(150);
      await page.screenshot({ path: SHOT + 'pulse-play.png' });
      await page.waitForSelector('#overOv.show', { timeout: 15000 });
      best = +(await page.textContent('#overScore'));
    }
    await page.screenshot({ path: SHOT + 'pulse-over.png' });
    // pure miss: tap immediately
    await page.click('#againBtn'); await page.waitForTimeout(100); await page.mouse.click(195, 300);
    await page.waitForSelector('#overOv.show', { timeout: 3000 });
    const missScore = await page.textContent('#overScore');
    // no tap at all: ring passes the target -> game over
    await page.click('#againBtn'); await page.waitForSelector('#overOv.show', { timeout: 5000 });
    const pill = await page.textContent('#bestPill');
    await page.click('#prizeBtnB'); await page.waitForSelector('#prizeOv.show');
    await page.screenshot({ path: SHOT + 'pulse-prize.png' });
    results.pulse = { bestTimedScore: best, missScore, pill, errs };
    await page.close();
  }

  // ---- Math Sprint ----
  {
    const { page, errs } = await open('math', 'math-sprint/math-sprint.html');
    await page.screenshot({ path: SHOT + 'math-start.png' });
    await page.click('#playBtn');
    const evalQ = t => { const [a, op, b] = t.split(' '); const A = +a, B = +b;
      return op === '+' ? A + B : op === '−' ? A - B : op === '×' ? A * B : A / B; };
    const firstQs = [];
    for (let k = 0; k < 12; k++) {
      const q = await page.textContent('#q'); firstQs.push(q); const ans = evalQ(q);
      const vals = await page.$$eval('.ans', bs => bs.map(b => +b.textContent));
      const idx = vals.indexOf(ans); if (idx < 0) throw new Error('correct answer missing for ' + q + ' ' + vals);
      await page.locator('.ans').nth(idx).dispatchEvent('pointerdown');
    }
    await page.screenshot({ path: SHOT + 'math-play.png' });
    // drain clock with wrong answers
    while (!(await page.isVisible('#overOv.show'))) {
      const q = await page.textContent('#q'); if (q === 'Time!') { await page.waitForTimeout(500); continue; }
      const ans = evalQ(q); const vals = await page.$$eval('.ans', bs => bs.map(b => +b.textContent));
      const idx = vals.findIndex(v => v !== ans);
      await page.locator('.ans').nth(idx).dispatchEvent('pointerdown'); await page.waitForTimeout(300);
    }
    await page.screenshot({ path: SHOT + 'math-over.png' });
    const out = { score: await page.textContent('#oScore'), correct: await page.textContent('#oCorrect'), acc: await page.textContent('#oAcc'), best: await page.textContent('#oBest') };
    // replay: same first question (daily seed)
    await page.click('#againBtn');
    const replayFirst = await page.textContent('#q');
    results.math = { ...out, firstQs: firstQs.slice(0, 5), replayFirstMatches: replayFirst === firstQs[0], errs };
    await page.close();
  }
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
