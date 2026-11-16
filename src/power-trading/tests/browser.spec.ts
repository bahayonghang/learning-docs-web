import { test as base, expect, type Page, type TestInfo } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chapters } from '../src/content/index';
import { labs } from '../src/labs/definitions';
import type { LabId, Locale } from '../src/types';

/** Production-browser checks: fail on uncaught exceptions, console errors and failed site resources. */
const test = base.extend<{ runtimeGuard: void }>({
  runtimeGuard: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    page.on('response', response => {
      if (response.url().startsWith('http://127.0.0.1:4175/') && response.status() >= 400)
        errors.push(`HTTP ${response.status()}: ${response.url()}`);
    });
    page.on('requestfailed', request => {
      // Navigating away may legitimately cancel an outstanding lazy image request.
      if (request.url().startsWith('http://127.0.0.1:4175/') && request.failure()?.errorText !== 'net::ERR_ABORTED')
        errors.push(`requestfailed: ${request.url()} — ${request.failure()?.errorText}`);
    });
    await use();
    expect(errors, 'Browser exceptions, console errors, and failed local resources').toEqual([]);
  }, { auto: true }],
});

async function visit(page: Page, route = '') {
  await page.goto(`/#/${route}`);
  await expect(page.locator('#page h1')).toBeVisible();
}
async function setLocale(page: Page, locale: Locale) {
  await page.locator('#locale-select').selectOption(locale);
  await expect(page.locator('html')).toHaveAttribute('lang', locale === 'zh' ? 'zh-CN' : 'en');
}
async function noOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  expect(sizes.document, `Document overflow at ${page.url()}`).toBeLessThanOrEqual(sizes.viewport + 1);
  expect(sizes.body, `Body overflow at ${page.url()}`).toBeLessThanOrEqual(sizes.viewport + 1);
}
async function loadedImages(page: Page, selector = '#page img', locale?: Locale) {
  for (const image of await page.locator(selector).all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute('alt', /\S/);
    if (locale) await expect(image).toHaveAttribute('src', new RegExp(`-${locale}\\.webp$`));
    await expect.poll(() => image.evaluate(node => {
      const img = node as HTMLImageElement;
      return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
    }), { message: `Image must decode: ${await image.getAttribute('src')}` }).toBe(true);
  }
}
async function capture(page: Page, info: TestInfo, name: string, fullPage = false) {
  await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); });
  const directory = resolve('test-results/screenshots');
  await mkdir(directory, { recursive: true });
  const path = resolve(directory, `${name}-${info.project.name}.png`);
  await page.screenshot({ path, fullPage, animations: 'disabled' });
  await info.attach(name, { path, contentType: 'image/png' });
}
async function setRange(page: Page, name: string, value: number) {
  const input = page.locator(`.lab-controls input[name="${name}"]`);
  await input.evaluate((node, next) => {
    const range = node as HTMLInputElement;
    range.value = String(next);
    range.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
  // Browser-native range normalization must not silently change the test input.
  await expect(input).toHaveValue(String(value));
}
async function finishSteps(page: Page, count: number) {
  for (let i = 0; i < count; i++) await page.locator('[data-action="step"]').click();
}

// Exactly six representative screenshots are emitted across desktop and mobile projects.
test('home renders both editions with decoded illustrations and responsive layout', async ({ page }, info) => {
  await visit(page);
  for (const locale of ['zh', 'en'] as const) {
    await setLocale(page, locale);
    await expect(page.locator('.hero h1')).not.toBeEmpty();
    await expect(page.locator('.atlas-stats')).toContainText(String(chapters.length));
    await expect(page.locator('.atlas-stats')).toContainText(String(labs.length));
    await loadedImages(page, '#page img', locale);
    await noOverflow(page);
    if (info.project.name === 'desktop' || locale === 'zh') await capture(page, info, `home-${locale}`);
  }
});

for (const locale of ['zh', 'en'] as const) {
  test(`all 24 lessons render prose, mathematics, localized figures and navigation (${locale})`, async ({ page }) => {
    test.setTimeout(180_000);
    expect(chapters).toHaveLength(24);
    await visit(page, 'chapter/01');
    await setLocale(page, locale);
    for (const chapter of chapters) {
      await test.step(`Lesson ${chapter.id}: ${chapter.title[locale]}`, async () => {
        await visit(page, `chapter/${chapter.id}`);
        await expect(page.locator('.lesson-header h1')).toHaveText(chapter.title[locale]);
        await expect(page.locator('.lesson-section')).toHaveCount(chapter.sections.length);
        await expect(page.locator('.lesson-section .prose').first()).not.toBeEmpty();
        await expect(page.locator('#worked-body')).not.toBeEmpty();
        await expect(page.locator('#page .katex-error')).toHaveCount(0);
        await expect(page.locator('.lesson-figure img')).toHaveCount(1);
        await loadedImages(page, '.lesson-figure img', locale);
        const active = page.locator(`.chapter-nav [data-chapter="${chapter.id}"]`);
        await expect(active).toHaveAttribute('aria-current', 'page');
        expect(await active.evaluate(node => node.closest('details')?.open)).toBe(true);
        await noOverflow(page);
      });
    }
  });

  test(`all 12 experiments render graphics and respond to their controls (${locale})`, async ({ page }, info) => {
    test.setTimeout(150_000);
    expect(labs).toHaveLength(12);
    await visit(page, 'labs');
    await setLocale(page, locale);
    for (const lab of labs) {
      await test.step(`Lab ${lab.id}`, async () => {
        await visit(page, `lab/${lab.id}`);
        await expect(page.locator('#page h1')).toHaveText(lab.title[locale]);
        await expect(page.locator('#lab-host .power-lab')).toBeVisible();
        await expect(page.locator('.lab-output')).not.toBeEmpty();
        expect(await page.locator('.lab-output svg, .lab-output .lab-bars').count()).toBeGreaterThan(0);
        expect(await page.locator('.lab-controls input, .lab-controls select').evaluateAll(nodes => nodes.every(node => Boolean(node.closest('label'))))).toBe(true);
        await expect(page.locator('.lab-boundary')).toContainText(/\S/);
        const before = await page.locator('.lab-output').textContent();
        const control = page.locator('.lab-controls input, .lab-controls select').first();
        const tag = await control.evaluate(node => node.tagName);
        if (tag === 'SELECT') {
          const values = await control.locator('option').evaluateAll(options => options.map(o => (o as HTMLOptionElement).value));
          await control.selectOption(values.at(-1)!);
        } else {
          await control.focus();
          await page.keyboard.press('End');
        }
        await expect.poll(() => page.locator('.lab-output').textContent()).not.toBe(before);
        await page.locator('[data-action="reset"]').click();
        if (locale === 'zh' && info.project.name === 'desktop' && lab.id === 'merit-order') {
          await finishSteps(page, 4);
          await capture(page, info, 'lab-clearing-zh', true);
        }
        if (locale === 'zh' && info.project.name === 'mobile' && lab.id === 'storage') {
          await finishSteps(page, 6);
          await capture(page, info, 'lab-storage-zh', true);
        }
        await noOverflow(page);
      });
    }
  });
}

test('energy, settlement, shortages and inventory match independently calculated examples', async ({ page }) => {
  await visit(page, 'lab/energy');
  await setLocale(page, 'zh');
  await setRange(page, 'power', 10); await setRange(page, 'hours', 0.25); await setRange(page, 'price', 400);
  await expect(page.locator('.lab-metric strong').nth(0)).toHaveText('2.5 MWh');
  await expect(page.locator('.lab-metric strong').nth(1)).toHaveText('1,000 CNY');

  await visit(page, 'lab/settlement');
  await setRange(page, 'day', 25); await setRange(page, 'actual', 27.5);
  await setRange(page, 'dayPrice', 400); await setRange(page, 'realPrice', 800);
  // Energy inputs are already MWh: 25*400 + (27.5-25)*800 = 12,000.
  await expect(page.locator('.lab-metric strong').nth(1)).toHaveText('12,000 CNY');
  await setRange(page, 'day', 100); await setRange(page, 'actual', 110);
  await expect(page.locator('.lab-metric strong').nth(1)).toHaveText('48,000 CNY');
  await setRange(page, 'actual', 90);
  await expect(page.locator('.lab-metric strong').nth(0)).toHaveText('-10 MWh');
  await expect(page.locator('.lab-metric strong').nth(1)).toHaveText('32,000 CNY');
  await noOverflow(page);

  await visit(page, 'lab/expectation');
  for (const field of ['low', 'normal', 'spike']) await setRange(page, field, 0);
  await expect(page.getByRole('alert')).toContainText('总权重为 0');
  await page.locator('[data-action="reset"]').click();
  await expect(page.getByRole('alert')).toHaveCount(0);

  await visit(page, 'lab/merit-order');
  await setRange(page, 'demand', 220); await setRange(page, 'renewable', 0);
  await finishSteps(page, 4);
  await expect(page.locator('.lab-warning')).toContainText('90 MW');
  await expect(page.locator('.lab-metric strong').nth(1)).toHaveText('未定义');

  await visit(page, 'lab/storage');
  await finishSteps(page, 6);
  await expect(page.locator('.lab-metric strong').nth(0)).toHaveText('0 / 4 MWh');
  await expect(page.locator('.lab-metric strong').nth(1)).toHaveText('1,496 CNY');
  await page.locator('[data-action="preset"]').click();
  await finishSteps(page, 6);
  await expect(page.locator('.lab-warning')).toContainText('期末还有');
  await noOverflow(page);
});

test('step, reset and reduced motion work in every animated experiment', async ({ page }) => {
  await page.clock.install();
  const animations: { id: LabId; initial: number; total: number }[] = [
    { id: 'gradient', initial: 0, total: 80 }, { id: 'merit-order', initial: 0, total: 4 },
    { id: 'backtest', initial: 1, total: 24 }, { id: 'storage', initial: 0, total: 6 },
  ];
  for (const lab of animations) {
    await visit(page, `lab/${lab.id}`);
    await expect(page.locator('[data-iteration]')).toHaveText(`${lab.initial} / ${lab.total}`);
    await page.locator('[data-action="step"]').click();
    await expect(page.locator('[data-iteration]')).toHaveText(`${lab.initial + 1} / ${lab.total}`);
    await page.locator('[data-action="reset"]').click();
    await expect(page.locator('[data-iteration]')).toHaveText(`${lab.initial} / ${lab.total}`);
    await page.locator('[data-action="play"]').click();
    await page.clock.runFor(2_000);
    await expect(page.locator('[data-iteration]')).toHaveText(`${lab.initial + 1} / ${lab.total}`);
    await expect(page.locator('[data-action="play"]')).toHaveAttribute('aria-pressed', 'false');
  }
});

test('normal playback advances, pauses and stops when leaving the experiment', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await visit(page, 'lab/gradient');
  await page.locator('[data-action="play"]').click();
  await expect(page.locator('[data-action="play"]')).toHaveAttribute('aria-pressed', 'true');
  await page.clock.runFor(1_400);
  expect(Number((await page.locator('[data-iteration]').innerText()).split('/')[0])).toBeGreaterThan(1);
  await page.locator('[data-action="play"]').click();
  const paused = await page.locator('[data-iteration]').innerText();
  await page.clock.runFor(2_000);
  await expect(page.locator('[data-iteration]')).toHaveText(paused);
  await page.locator('[data-action="play"]').click();
  // Use in-document navigation so the old lab must clean up without a document reload.
  await page.locator('.lab-reading a').first().click();
  await expect(page.locator('.lesson-header')).toBeVisible();
  await page.clock.runFor(2_000);
  await expect(page.locator('#page .power-lab')).toHaveCount(0);
});

test('search and filters return real lessons, experiments, illustrations and sources', async ({ page }) => {
  await visit(page, 'course'); await setLocale(page, 'zh');
  const marketLesson = chapters.find(c => c.id === '11')!;
  await page.locator('#course-search').fill(marketLesson.title.zh);
  await expect(page.locator('#course-list a[href="#/chapter/11"]')).toBeVisible();
  await page.locator('#course-search').fill('zxqvnevermatch98317');
  await expect(page.locator('#course-list .empty-state')).toBeVisible();

  await visit(page, 'labs');
  await page.locator('[data-category="foundations"]').click();
  await expect(page.locator('#lab-list a[href="#/lab/energy"]')).toBeVisible();
  await expect(page.locator('#lab-list a[href="#/lab/settlement"]')).toHaveCount(0);
  await page.locator('[data-category="all"]').click();
  await page.locator('#catalog-search').fill('settlement');
  await expect(page.locator('#lab-list .lab-card')).toHaveCount(1);
  await expect(page.locator('#lab-list .lab-card')).toHaveAttribute('href', '#/lab/settlement');

  await visit(page, 'figures');
  await page.locator('[data-category="markets"]').click();
  await expect(page.locator('#figure-list [data-figure="market-clearing"]')).toBeVisible();
  await expect(page.locator('#figure-list [data-figure="foundations"]')).toHaveCount(0);
  await page.locator('#catalog-search').fill('日前');
  await expect(page.locator('#figure-list [data-figure="settlement"]')).toBeVisible();
  await loadedImages(page, '#figure-list img', 'zh');

  await page.locator('[data-open-search]').click();
  await expect(page.locator('#global-search')).toBeFocused();
  await page.locator('#global-search').fill('settlement');
  await page.locator('#search-results a[href="#/lab/settlement"]').first().click();
  await expect(page).toHaveURL(/#\/lab\/settlement$/);
  await expect(page.locator('#search-dialog')).not.toBeVisible();

  await visit(page, 'resources');
  await page.locator('#source-kind').selectOption('documentation');
  expect(await page.locator('.source-card').count()).toBeGreaterThan(0);
  await page.locator('[data-resource-tab="glossary"]').click();
  await expect(page.locator('#source-kind')).not.toBeVisible();
  await page.locator('#resource-search').fill('MW');
  expect(await page.locator('.glossary-card').count()).toBeGreaterThan(0);
  await noOverflow(page);
});

test('quiz feedback is specific; localized illustrations enlarge and download', async ({ page }) => {
  await visit(page, 'chapter/11'); await setLocale(page, 'zh');
  const feedback = new Set<string>(), outcomes = new Set<string>();
  for (const option of await page.locator('.quiz-option').all()) {
    await option.click();
    await expect(page.locator('.quiz-option[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator('#quiz-feedback')).toBeVisible();
    feedback.add(await page.locator('#quiz-feedback').innerText());
    outcomes.add((await page.locator('#quiz-feedback').getAttribute('class'))!.split(' ').at(-1)!);
  }
  expect(feedback.size).toBe(await page.locator('.quiz-option').count());
  expect(outcomes).toEqual(new Set(['correct', 'incorrect']));
  await expect(page.locator('.lesson-figure img')).toHaveAttribute('src', /market-clearing-zh\.webp$/);
  await setLocale(page, 'en');
  await expect(page.locator('.lesson-heading-line > span')).toHaveText('11');
  await expect(page.locator('.lesson-figure img')).toHaveAttribute('src', /market-clearing-en\.webp$/);
  await page.locator('.figure-zoom').click();
  await expect(page.locator('#figure-dialog')).toBeVisible();
  await loadedImages(page, '#figure-dialog img', 'en');
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#figure-dialog a[download]').click()]);
  expect(download.suggestedFilename()).toBe('power-trading-atlas-market-clearing-en.webp');
  expect(await download.failure()).toBeNull();
  expect((await readFile((await download.path())!)).length).toBeGreaterThan(1000);
  await page.locator('[data-close-figure]').click();
  await expect(page.locator('.figure-zoom')).toBeFocused();
});

test('complete course books download in both languages and include the last lesson', async ({ page }) => {
  await visit(page, 'resources');
  for (const locale of ['zh', 'en'] as const) {
    await setLocale(page, locale);
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('.resource-download a[download]').click()]);
    expect(download.suggestedFilename()).toBe(`power-trading-atlas-${locale}.md`);
    expect(await download.failure()).toBeNull();
    const text = await readFile((await download.path())!, 'utf8');
    expect(text).toContain(chapters[0].title[locale]);
    expect(text).toContain(chapters.at(-1)!.title[locale]);
    expect(text).toContain('https://');
    expect(text.length).toBeGreaterThan(10_000);
  }
});

test('navigation preserves the selected chapter and uses an accessible mobile drawer', async ({ page }, info) => {
  await visit(page, 'chapter/22');
  if (info.project.name === 'desktop') {
    const sidebar = page.locator('.sidebar-scroll');
    const position = await sidebar.evaluate(node => { node.scrollTop = node.scrollHeight; return node.scrollTop; });
    await page.locator('.lesson-pagination a[href="#/chapter/23"]').click();
    await expect(page.locator('[data-chapter="23"]')).toHaveAttribute('aria-current', 'page');
    expect(Math.abs(await sidebar.evaluate(node => node.scrollTop) - position)).toBeLessThanOrEqual(2);
  } else {
    const toggle = page.locator('#menu-toggle');
    await expect(page.locator('#sidebar')).toHaveJSProperty('inert', true);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.workspace')).toHaveJSProperty('inert', true);
    await expect(page.locator('.main-nav a').first()).toBeFocused();
    await page.locator('.sidebar-footer a').focus(); await page.keyboard.press('Tab');
    await expect(page.locator('.brand')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('.sidebar-footer a')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await toggle.click();
    await page.locator('[data-chapter="23"]').click();
    await expect(page.locator('#page')).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.workspace')).toHaveJSProperty('inert', false);
  }
  await expect(page.locator('.lesson-heading-line > span')).toHaveText('23');
  await setLocale(page, 'en');
  await expect(page.locator('[data-chapter="23"]')).toHaveAttribute('aria-current', 'page');
  expect(await page.locator('[data-chapter="23"]').evaluate(node => node.closest('details')?.open)).toBe(true);
  await noOverflow(page);
});

test('theme, text size and language persist; unknown routes recover to the curriculum', async ({ page }, info) => {
  await visit(page, 'chapter/01');
  await page.locator('#theme-toggle').click(); await page.locator('#theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#text-size').click();
  await setLocale(page, 'en');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-text', 'large');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#text-size')).toHaveAttribute('aria-pressed', 'true');
  await loadedImages(page, '.lesson-figure img', 'en');
  await noOverflow(page);
  if (info.project.name === 'desktop') await capture(page, info, 'lesson-dark-en');
  await visit(page, 'unknown-route');
  await expect(page.locator('.not-found')).toBeVisible();
  await page.locator('.not-found a[href="#/course"]').click();
  await expect(page).toHaveURL(/#\/course$/);
  await expect(page.locator('.curriculum-module')).toHaveCount(6);
});
