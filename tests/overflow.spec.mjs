// 16:9 overflow (best effort): with the preview at 1280x720 (the size the iframe content
// would get), walk every slide and look for elements whose box leaves the 1920x1080 stage.
import { test, expect } from '@playwright/test';
import { SLUG, artifactPath } from './helpers.mjs';

const TOL = 1; // stage px

test('no element leaves the 1920x1080 stage on any slide', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`preview/${SLUG}/template.html`);
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => document.querySelector('deck-stage')?.length > 0);
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => document.querySelector('deck-stage').length);

  const report = [];
  for (let i = 0; i < total; i++) {
    await page.evaluate((n) => document.querySelector('deck-stage').goTo(n), i);
    await page.waitForTimeout(450);
    if (i === 0 || i === 4) {
      await page.waitForTimeout(1800); // let the deck's slide-count overlay fade
      await page.screenshot({ path: artifactPath(`preview-slide-${String(i + 1).padStart(2, '0')}.png`) });
    }
    const res = await page.evaluate(({ tol }) => {
      const slide = document.querySelector('[data-deck-active]');
      const sr = slide.getBoundingClientRect();
      const scale = sr.width / 1920;
      const sel = (el) => {
        const parts = [];
        for (let e = el; e && e !== slide; e = e.parentElement) {
          let p = e.tagName.toLowerCase();
          if (e.classList.length) p += '.' + [...e.classList].join('.');
          else if (e.parentElement) p += `:nth-child(${[...e.parentElement.children].indexOf(e) + 1})`;
          parts.unshift(p);
        }
        return `${slide.className.split(' ').map((c) => '.' + c).join('')} > ${parts.join(' > ')}`;
      };
      const out = [];
      let checked = 0;
      for (const el of slide.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        checked++;
        const box = {
          left: (r.left - sr.left) / scale, top: (r.top - sr.top) / scale,
          right: (r.right - sr.left) / scale, bottom: (r.bottom - sr.top) / scale,
        };
        if (box.left < -tol || box.top < -tol || box.right > 1920 + tol || box.bottom > 1080 + tol) {
          const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          out.push({
            selector: sel(el),
            hasText,
            text: hasText ? el.textContent.trim().slice(0, 40) : '',
            box: Object.fromEntries(Object.entries(box).map(([k, v]) => [k, Math.round(v)])),
          });
        }
      }
      return { checked, scale, label: slide.getAttribute('data-label'), stage: { w: Math.round(sr.width), h: Math.round(sr.height) }, out };
    }, { tol: TOL });
    expect(res.checked, `slide ${i + 1}: no visible elements measured`).toBeGreaterThan(3);
    expect(Math.abs(res.scale - 1280 / 1920), `slide ${i + 1} stage scale`).toBeLessThan(0.01);
    for (const o of res.out) report.push({ slide: i + 1, label: res.label, ...o });
  }

  test.info().annotations.push({ type: 'overflow-report', description: JSON.stringify(report, null, 1) });
  const textOffenders = report.filter((r) => r.hasText);
  const otherOffenders = report.filter((r) => !r.hasText);
  if (otherOffenders.length) {
    test.info().annotations.push({ type: 'decorative-overflow', description: `${otherOffenders.length} non-text element(s) extend past the stage (see overflow-report)` });
  }
  expect(textOffenders, 'text elements extending outside the 1920x1080 stage').toEqual([]);
  expect.soft(otherOffenders, 'non-text elements extending outside the 1920x1080 stage').toEqual([]);
});
