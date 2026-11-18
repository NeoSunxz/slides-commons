import { test, expect } from './font-cache.mjs';
import { ALL_SLUGS, artifactPath } from './helpers.mjs';
import { indexPage } from '../src/pages.mjs';

const openHome = async (page, url) => {
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
};
const goToChapter = async (page, index, height) => {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), index * (height - 72));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(index * (height - 72), 0);
  await expect.poll(() => page.locator('.home-chapter').nth(index).evaluate((element) => getComputedStyle(element).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
};

for (const [lang, home, gallery] of [['en', 'index.html', 'gallery/'], ['zh', 'zh/index.html', 'zh/gallery/']]) {
  test(`${lang} compact footer links to full credits without repeating attribution`, async ({ page }) => {
    await openHome(page, home);
    const footer = page.locator('footer.site-footer');
    await expect(footer).toHaveCount(1);
    await expect(footer).toContainText('slides-commons');
    await expect(footer.locator('a')).toHaveCount(1);
    await expect(footer).not.toContainText('Zara Zhang');
    await expect(footer).not.toContainText('MIT');
    await expect(page.locator('.home-origin')).toContainText('Zara Zhang');
    await footer.locator('a').click();
    await expect(page).toHaveURL(/credits\.html$/);
    await expect(page.locator('main')).toContainText('Zara Zhang');
    await expect(page.locator('main')).toContainText('MIT');
  });

  test(`${lang} homepage keeps the gallery separate`, async ({ page }) => {
    await openHome(page, home);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('#filters')).toHaveCount(0);
    await expect(page.locator('.home-chapter')).toHaveCount(5);
    await expect(page.locator('.home-work')).toHaveCount(16);
    await expect(page.locator('.home-work:not([inert])')).toHaveCount(1);
    await expect(page.locator('.home-hero h1 img')).toHaveCount(0);
    await expect(page.locator('.hero-wall')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.hero-wall-column')).toHaveCount(4);
    await expect(page.locator('.hero-wall img')).toHaveCount(32);
    await expect(page.locator('.home-process-steps li')).toHaveCount(3);
    await page.locator('.home-hero .home-pill').click();
    await expect(page).toHaveURL(new RegExp(`/${gallery}$`));
    await expect(page.locator('#grid .card')).toHaveCount(ALL_SLUGS.length);
  });

  for (const [width, height] of [[1920, 1080], [1440, 810], [1280, 720]]) {
    test(`${lang} five equal chapters at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await openHome(page, home);
      await expect(page.locator('.home-main')).toHaveClass(/chapter-stack/);
      const sizes = await page.locator('.home-chapter').evaluateAll((elements) => elements.map((element) => ({ height: element.offsetHeight, width: element.offsetWidth, background: getComputedStyle(element).backgroundColor })));
      expect(new Set(sizes.map((size) => size.background)).size).toBe(5);
      for (const size of sizes) {
        expect(size.height).toBe(height - 72);
        expect(size.width).toBe(width);
      }
      for (let index = 0; index < 5; index += 1) {
        await goToChapter(page, index, height);
        const chapter = page.locator('.home-chapter').nth(index);
        await expect.poll(() => page.locator('.site-header').evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(sizes[index].background);
        const bounds = await chapter.boundingBox();
        await expect(page.locator('.site-header .brand')).toBeInViewport();
        expect(bounds.y).toBeCloseTo(72, 0);
        expect(bounds.y + bounds.height).toBeCloseTo(height, 0);
        const overflows = await chapter.locator('h1, h2, p, li, .home-work-image, .home-pill, .home-source-list a').evaluateAll((elements) => elements.filter((element) => {
          if (element.closest('[inert]')) return false;
          const rect = element.getBoundingClientRect();
          return rect.top < 72 || rect.bottom > innerHeight + 1 || rect.left < 0 || rect.right > innerWidth + 1 || element.scrollWidth > element.clientWidth + 1;
        }).map((element) => element.className || element.tagName));
        expect(overflows).toEqual([]);
        expect(await page.evaluate(() => document.elementFromPoint(innerWidth / 2, innerHeight - 2)?.closest('.home-chapter')?.getAttribute('aria-labelledby'))).toBe(await chapter.getAttribute('aria-labelledby'));
        if (index === 1) await expect.poll(() => chapter.locator('.home-work:not([inert]) img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.screenshot({ path: artifactPath(`chapter-${lang}-${width}-${index + 1}.png`) });
      }
    });
  }

  for (const [width, height] of [[768, 1024], [390, 844], [320, 740]]) {
    test(`${lang} natural reading flow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await openHome(page, home);
      await expect(page.locator('.home-main')).not.toHaveClass(/chapter-stack/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      for (const chapter of await page.locator('.home-chapter').all()) {
        await chapter.scrollIntoViewIfNeeded();
        expect(await chapter.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
      }
      await page.locator('.home-work:not([inert])').last().scrollIntoViewIfNeeded();
      await expect.poll(() => page.locator('.home-work:not([inert]) img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
      await page.screenshot({ path: artifactPath(`chapters-${lang}-${width}.png`), fullPage: true });
    });
  }
}

test('transitions belong to whole chapters, not individual content', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await openHome(page, 'zh/');
  await expect(page.locator('.home-main')).toHaveClass(/chapter-stack/);
  await page.evaluate(() => { document.documentElement.style.scrollSnapType = 'none'; window.scrollTo({ top: 369, behavior: 'instant' }); });
  await expect.poll(() => page.locator('.home-hero').evaluate((element) => Number(element.style.getPropertyValue('--chapter-scale')))).toBeLessThan(1);
  const next = await page.locator('.home-showcase').boundingBox();
  expect(next.y).toBeGreaterThan(72);
  expect(next.y).toBeLessThan(810);
  expect(await page.locator('.home-hero h1').evaluate((element) => getComputedStyle(element).transform)).toBe('none');
  await page.screenshot({ path: artifactPath('chapter-transition.png') });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => page.locator('.home-hero').evaluate((element) => element.style.getPropertyValue('--chapter-scale'))).toBe('1');
});

test('reduced motion disables stacking without hiding content', async ({ page }) => {
  await openHome(page, 'zh/');
  await expect(page.locator('.home-main')).toHaveClass(/chapter-stack/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.home-main')).not.toHaveClass(/chapter-stack/);
  for (const chapter of await page.locator('.home-chapter').all()) {
    expect(await chapter.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
  }
  await page.locator('.home-closing .home-pill').click();
  await expect(page.locator('#grid .card')).toHaveCount(ALL_SLUGS.length);
});

test('wheel and PageDown settle on a whole chapter; footer stays reachable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await openHome(page, 'zh/');
  await page.mouse.move(1100, 450);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(738);
  await page.keyboard.press('PageDown');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(1476);
  await page.mouse.wheel(0, -400);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(738);
  await page.keyboard.press('End');
  await expect(page.locator('.site-footer')).toBeInViewport();
});

test('keyboard focus brings an obscured chapter back into view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await openHome(page, 'index.html');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
  await goToChapter(page, 4, 810);
  const action = page.locator('.home-hero .home-pill');
  await action.focus();
  await expect(action).toBeFocused();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await action.click();
  await expect(page).toHaveURL(/\/gallery\/$/);
});

test('resizing or enlarged text falls back to unclipped document flow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await openHome(page, 'zh/');
  await expect(page.locator('.home-main')).toHaveClass(/chapter-stack/);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.home-main')).not.toHaveClass(/chapter-stack/);
  await page.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator('.home-main')).not.toHaveClass(/chapter-stack/);
  await page.locator('.home-closing .home-pill').click();
  await expect(page).toHaveURL(/\/zh\/gallery\/$/);
});

test('five readable chapters without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 810 } });
  try {
    const page = await context.newPage();
    await page.goto(new URL('zh/', baseURL).href);
    await expect(page.locator('.home-chapter')).toHaveCount(5);
    await expect(page.locator('.home-work:not([hidden])')).toHaveCount(2);
    await expect(page.locator('.home-carousel-controls')).toBeHidden();
    await page.locator('.home-closing .home-pill').click();
    await expect(page.locator('#grid .card')).toHaveCount(ALL_SLUGS.length);
  } finally { await context.close(); }
});

test('home renders without screenshots or a full collection', () => {
  for (const lang of ['en', 'zh']) {
    const html = indexPage({ templates: [], lang });
    expect(html).toContain('gallery/');
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('class="hero-sample"');
  }
});

test('carousel loops in both directions and keeps only visible cards focusable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await openHome(page, 'zh/');
  await goToChapter(page, 1, 810);
  const position = page.locator('.carousel-position');
  const firstHref = await page.locator('.home-work').first().getAttribute('href');
  await page.getByRole('button', { name: '上一个模板' }).click();
  await expect(position).toHaveText('16 / 16');
  for (let index = 1; index <= 16; index += 1) {
    await page.getByRole('button', { name: '下一个模板' }).click();
    await expect(position).toHaveText(`${String(index).padStart(2, '0')} / 16`);
    await expect(page.locator('.home-work:not([inert])')).toHaveCount(1);
    expect(await page.locator('.home-showcase').evaluate((element) => element.offsetHeight)).toBe(738);
  }
  await page.locator('.home-carousel').focus();
  await page.keyboard.press('ArrowRight');
  await expect(position).toHaveText('01 / 16');
  expect(await page.locator('.home-work:not([inert])').getAttribute('href')).toBe(firstHref);
  await page.keyboard.press('ArrowLeft');
  await expect(position).toHaveText('16 / 16');
  await page.screenshot({ path: artifactPath('carousel-zh-loop.png') });
  await page.locator('.home-work:not([inert])').first().click();
  await expect(page).toHaveURL(/\/zh\/t\/terminal-green\/$/);
});

test('phone carousel shows one card and supports swipe with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page, 'zh/');
  const carousel = page.locator('.home-carousel');
  await carousel.scrollIntoViewIfNeeded();
  await expect(page.locator('.home-work:not([inert])')).toHaveCount(1);
  await carousel.evaluate((element) => {
    const start = new Touch({ identifier: 1, target: element, clientX: 300, clientY: 300 });
    const end = new Touch({ identifier: 1, target: element, clientX: 100, clientY: 310 });
    element.dispatchEvent(new TouchEvent('touchstart', { touches: [start] }));
    element.dispatchEvent(new TouchEvent('touchend', { changedTouches: [end] }));
  });
  await expect(page.locator('.carousel-position')).toHaveText('02 / 16');
  expect(await page.locator('.home-work-grid').evaluate((element) => element.getAnimations().length)).toBe(0);
  await carousel.evaluate((element) => {
    const start = new Touch({ identifier: 2, target: element, clientX: 100, clientY: 300 });
    const end = new Touch({ identifier: 2, target: element, clientX: 110, clientY: 100 });
    element.dispatchEvent(new TouchEvent('touchstart', { touches: [start] }));
    element.dispatchEvent(new TouchEvent('touchend', { changedTouches: [end] }));
  });
  await expect(page.locator('.carousel-position')).toHaveText('02 / 16');
  await page.setViewportSize({ width: 1440, height: 810 });
  await expect(page.locator('.home-work:not([inert])')).toHaveCount(1);
});

test('layered cards have one foreground; wheel switches cards without trapping page navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await openHome(page, 'zh/');
  await goToChapter(page, 1, 810);
  const center = page.locator('.home-work[data-position="0"]');
  const centerBounds = await center.boundingBox();
  const leftBounds = await page.locator('.home-work[data-position="-1"]').boundingBox();
  const rightBounds = await page.locator('.home-work[data-position="1"]').boundingBox();
  expect(centerBounds.width).toBeGreaterThan(leftBounds.width);
  expect(centerBounds.width).toBeGreaterThan(rightBounds.width);
  expect(leftBounds.x).toBeLessThan(centerBounds.x);
  expect(rightBounds.x).toBeGreaterThan(centerBounds.x);
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 120);
  await expect(page.locator('.carousel-position')).toHaveText('02 / 16');
  expect(await page.evaluate(() => scrollY)).toBe(738);
  await page.mouse.move(20, 300);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(1476);
});

test('autoplay runs only while visible, pauses on hover and focus, and can be stopped', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await openHome(page, 'zh/');
  const carousel = page.locator('.home-carousel');
  await expect(carousel).toHaveAttribute('data-autoplay', 'paused');
  await goToChapter(page, 1, 810);
  await expect(carousel).toHaveAttribute('data-autoplay', 'running');
  await expect(page.locator('.carousel-position')).toHaveText('02 / 16', { timeout: 7000 });
  await page.mouse.move(720, 450);
  await expect(carousel).toHaveAttribute('data-autoplay', 'paused');
  await page.mouse.move(20, 100);
  await expect(carousel).toHaveAttribute('data-autoplay', 'running');
  await carousel.focus();
  await expect(carousel).toHaveAttribute('data-autoplay', 'paused');
  await page.getByRole('button', { name: '暂停自动轮播' }).click();
  await expect(page.getByRole('button', { name: '开启自动轮播' })).toBeVisible();
  await page.locator('.home-showcase h2').evaluate((element) => { element.tabIndex = -1; element.focus(); });
  await page.mouse.move(20, 100);
  await expect(carousel).toHaveAttribute('data-autoplay', 'paused');
  await page.getByRole('button', { name: '开启自动轮播' }).click();
  await page.locator('.home-showcase h2').focus();
  await page.mouse.move(20, 100);
  await expect(carousel).toHaveAttribute('data-autoplay', 'running');
  await goToChapter(page, 2, 810);
  await expect(carousel).toHaveAttribute('data-autoplay', 'paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.carousel-play')).toBeDisabled();
});

test('chapter 05 arrow follows the pointer and resets with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await openHome(page, 'zh/');
  await goToChapter(page, 4, 810);
  const orbit = page.locator('.closing-orbit');
  await page.mouse.move(850, 250);
  const first = await orbit.evaluate((element) => element.style.getPropertyValue('--orbit-angle'));
  expect(first).not.toBe('');
  await page.mouse.move(1300, 650);
  expect(await orbit.evaluate((element) => element.style.getPropertyValue('--orbit-angle'))).not.toBe(first);
  await page.screenshot({ path: artifactPath('closing-pointer.png') });
  await page.mouse.move(100, 30);
  const restingAngle = await orbit.evaluate((element) => parseFloat(element.style.getPropertyValue('--orbit-angle')));
  expect(((restingAngle + 12) % 360 + 360) % 360).toBeCloseTo(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.mouse.move(850, 250);
  expect(await orbit.evaluate((element) => element.style.getPropertyValue('--orbit-angle'))).toBe('');
});

for (const [home, gallery, label] of [['index.html', '/gallery/', 'Explore the gallery'], ['zh/index.html', '/zh/gallery/', '浏览模板画廊']]) {
  test(`${home} chapter 05 circle opens the gallery by pointer and keyboard`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await openHome(page, home);
    await goToChapter(page, 4, 810);
    const circle = page.locator('a.closing-orbit');
    await expect(circle).toHaveAccessibleName(label);
    await circle.click();
    await expect(page).toHaveURL(new RegExp(`${gallery}$`));
    await openHome(page, home);
    await page.locator('.home-closing .home-pill').focus();
    await page.keyboard.press('Tab');
    await expect(circle).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${gallery}$`));
  });
}

test('chapter 05 arrow completes two turns in either direction without reversing at the angle seam', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await openHome(page, 'zh/');
  await goToChapter(page, 4, 810);
  const orbit = page.locator('.closing-orbit');
  for (const direction of [1, -1]) {
    const angles = [];
    for (let step = 0; step <= 48; step += 1) {
      const radians = direction * step * Math.PI / 12;
      const bounds = await orbit.boundingBox();
      await page.mouse.move(bounds.x + bounds.width / 2 + Math.cos(radians) * 150, bounds.y + bounds.height / 2 + Math.sin(radians) * 150);
      angles.push(await orbit.evaluate((element) => parseFloat(element.style.getPropertyValue('--orbit-angle'))));
    }
    for (let index = 1; index < angles.length; index += 1) {
      const delta = (angles[index] - angles[index - 1]) * direction;
      expect(delta).toBeGreaterThan(0);
      expect(delta).toBeLessThan(30);
    }
    expect((angles.at(-1) - angles[0]) * direction).toBeCloseTo(720, 0);
    const beforeLeave = angles.at(-1);
    await page.mouse.move(100, 30);
    const afterLeave = await orbit.evaluate((element) => parseFloat(element.style.getPropertyValue('--orbit-angle')));
    expect(Math.abs(afterLeave - beforeLeave)).toBeLessThanOrEqual(180);
  }
});

test('ordinary wheel notches turn pages instead of snapping back', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await openHome(page, 'zh/');
  await page.mouse.move(20, 450);
  for (const index of [1, 2, 3, 4, 5, 4, 3, 2, 1, 0]) {
    const target = index === 5 ? await page.evaluate(() => document.documentElement.scrollHeight - innerHeight) : index * 738;
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, target > before ? 120 : -120);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(target);
  }
});

test('trackpad momentum does not skip chapters or turn carousel cards during entry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await openHome(page, 'zh/');
  await page.mouse.move(720, 450);
  for (let tick = 0; tick < 30; tick += 1) {
    await page.mouse.wheel(0, 45);
    await page.waitForTimeout(25);
  }
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(738);
  await expect(page.locator('.carousel-position')).toHaveText('01 / 16');
  await expect(page.locator('.home-main')).not.toHaveAttribute('data-chapter-gesture');
  await page.mouse.wheel(0, 120);
  await expect(page.locator('.carousel-position')).toHaveText('02 / 16');
});

test('hero style wall animates without moving the title and respects reduced motion', async ({ page }) => {
  await openHome(page, 'zh/');
  await expect.poll(() => page.locator('.hero-wall img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
  const visibleTiles = await page.locator('.hero-wall').evaluate((wall) => {
    const bounds = wall.getBoundingClientRect();
    return [...wall.querySelectorAll('.hero-wall-tile')].filter((tile) => {
      const tileBounds = tile.getBoundingClientRect();
      return Math.min(bounds.bottom, tileBounds.bottom) - Math.max(bounds.top, tileBounds.top) > tileBounds.height / 2;
    }).length;
  });
  expect(visibleTiles).toBeGreaterThanOrEqual(10);
  expect(await page.locator('.hero-wall-track').first().evaluate((element) => element.getAnimations().length)).toBe(1);
  expect(await page.locator('.home-hero h1').evaluate((element) => getComputedStyle(element).transform)).toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.hero-wall-track').first().evaluate((element) => element.getAnimations().length)).toBe(0);
});

test('carousel pause control uses a graphical icon rather than Roman numerals', async ({ page }) => {
  await page.goto('zh/');
  const button = page.locator('.carousel-play');
  await expect(button).toHaveText('');
  await expect(button.locator('.carousel-play-icon')).toHaveCount(1);
  await expect(button).toHaveAttribute('aria-label', '暂停自动轮播');
  await button.click();
  await expect(button).not.toHaveClass(/is-playing/);
  await expect(button).toHaveAttribute('aria-label', '开启自动轮播');
  await expect(button.locator('.carousel-play-icon')).toHaveCount(1);
  await button.click();
  await expect(button).toHaveClass(/is-playing/);
});
