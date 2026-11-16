import { test as base, expect, type Page, type TestInfo } from '@playwright/test';
import { chapters } from '../src/content/index';
import { labs } from '../src/labs/definitions';
import type { Locale } from '../src/types';

/** Every test fails on uncaught browser exceptions, console errors or failed local HTTP responses. */
const test = base.extend<{ runtimeGuard: void }>({
  runtimeGuard: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });
    page.on('response', response => {
      if (response.url().startsWith('http://127.0.0.1:4174/') && response.status() >= 400) {
        errors.push(`HTTP ${response.status()}: ${response.url()}`);
      }
    });
    await use();
    expect(errors, 'Browser errors and failed local resources').toEqual([]);
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

async function assertNoHorizontalOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(sizes.document, `Document width at ${page.url()}`).toBeLessThanOrEqual(sizes.viewport + 1);
  expect(sizes.body, `Body width at ${page.url()}`).toBeLessThanOrEqual(sizes.viewport + 1);
}

async function assertImagesLoaded(page: Page, selector = '#page img', locale?: Locale) {
  const images = page.locator(selector);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute('alt', /\S/);
    if (locale) await expect(image).toHaveAttribute('src', new RegExp(`-${locale}\\.webp$`));
    await expect.poll(() => image.evaluate(node => {
      const element = node as HTMLImageElement;
      return element.complete && element.naturalWidth > 0;
    }), { message: `Image must decode: ${await image.getAttribute('src')}` }).toBe(true);
  }
}

async function capture(page: Page, info: TestInfo, name: string) {
  await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); });
  const path = info.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true, animations: 'disabled' });
  await info.attach(name, { path, contentType: 'image/png' });
}

test('homepages render localized illustrations and readable layouts', async ({ page }, info) => {
  await visit(page);
  for (const locale of ['zh', 'en'] as const) {
    await setLocale(page, locale);
    await expect(page.locator('.hero h1')).toContainText(locale === 'zh' ? '不再是黑箱' : 'make sense');
    await assertImagesLoaded(page, '#page img', locale);
    await assertNoHorizontalOverflow(page);
    await capture(page, info, `homepage-${locale}`);
  }
});

for (const locale of ['zh', 'en'] as const) {
  test(`all lesson routes render text, mathematics and localized images (${locale})`, async ({ page }, info) => {
    test.setTimeout(180_000);
    await visit(page, 'chapter/01');
    await setLocale(page, locale);
    for (const chapter of chapters) {
      await test.step(`Lesson ${chapter.id}`, async () => {
        await visit(page, `chapter/${chapter.id}`);
        await expect(page.locator('.lesson-heading-line > span')).toHaveText(chapter.id);
        await expect(page.locator('.lesson-header h1')).toHaveText(chapter.title[locale]);
        await expect(page.locator('.lesson-section .prose').first()).not.toBeEmpty();
        await expect(page.locator('#worked-body')).not.toBeEmpty();
        await expect(page.locator('#page .katex-error')).toHaveCount(0);
        await expect(page.locator('.lesson-figure img')).toHaveCount(1);
        await assertImagesLoaded(page, '.lesson-figure img', locale);
        await assertNoHorizontalOverflow(page);
        const active = page.locator(`.chapter-nav [data-chapter="${chapter.id}"]`);
        await expect(active).toHaveAttribute('aria-current', 'page');
        expect(await active.evaluate(node => node.closest('details')?.open)).toBe(true);
        if (chapter.id === '10' && locale === 'zh' && info.project.name === 'desktop') {
          await capture(page, info, 'chapter-attention');
        }
      });
    }
  });

  test(`all lab routes render working controls and outputs (${locale})`, async ({ page }, info) => {
    test.setTimeout(120_000);
    await visit(page, 'labs');
    await setLocale(page, locale);
    for (const lab of labs) {
      await test.step(`Lab ${lab.id}`, async () => {
        await visit(page, `lab/${lab.id}`);
        await expect(page.locator('#page h1')).toHaveText(lab.title[locale]);
        await expect(page.locator('#lab-host .llm-lab')).toBeVisible();
        await expect(page.locator('.lab-output')).not.toBeEmpty();
        await expect(page.locator('.lab-boundary summary')).toBeVisible();
        expect(await page.locator('.lab-controls input, .lab-controls select').evaluateAll(controls =>
          controls.every(control => Boolean(control.closest('label'))),
        )).toBe(true);
        await assertNoHorizontalOverflow(page);
        if (lab.id === 'attention' && locale === 'zh' && info.project.name === 'desktop') {
          await capture(page, info, 'lab-attention');
        }
      });
    }
  });
}

test('course search, collection filters and global search navigate to real results', async ({ page }) => {
  await visit(page, 'chapter/10');
  await setLocale(page, 'zh');
  const attentionTitle = await page.locator('.lesson-header h1').innerText();
  await visit(page, 'course');
  await page.locator('#course-search').fill(attentionTitle);
  await expect(page.locator('#course-list a[href="#/chapter/10"]')).toBeVisible();
  await page.locator('#course-search').fill('zxqvnevermatch98317');
  await expect(page.locator('#course-list .lesson-row')).toHaveCount(0);
  await expect(page.locator('#course-list .empty-state')).toBeVisible();

  await visit(page, 'labs');
  await page.locator('[data-category="foundations"]').click();
  await expect(page.locator('[data-category="foundations"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#lab-list a[href="#/lab/vectors"]')).toBeVisible();
  await expect(page.locator('#lab-list a[href="#/lab/attention"]')).toHaveCount(0);
  await page.locator('[data-category="all"]').click();
  await page.locator('#catalog-search').fill('softmax');
  await expect(page.locator('#lab-list .lab-card')).toHaveCount(1);
  await expect(page.locator('#lab-list .lab-card')).toHaveAttribute('href', '#/lab/softmax');

  await visit(page, 'figures');
  await page.locator('[data-category="architecture"]').click();
  await expect(page.locator('[data-figure="attention"]')).toBeVisible();
  await expect(page.locator('[data-figure="mathematics"]')).toHaveCount(0);
  await page.locator('#catalog-search').fill('查询');
  await expect(page.locator('#figure-list .figure-card')).toHaveCount(1);
  await expect(page.locator('#figure-list [data-figure]')).toHaveAttribute('data-figure', 'attention');

  await page.locator('[data-open-search]').click();
  await expect(page.locator('#search-dialog')).toBeVisible();
  await expect(page.locator('#global-search')).toBeFocused();
  await page.locator('#global-search').fill('LoRA');
  const result = page.locator('#search-results a[href="#/chapter/16"]').first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/#\/chapter\/16$/);
  await expect(page.locator('#search-dialog')).not.toBeVisible();
  await expect(page.locator('.lesson-heading-line > span')).toHaveText('16');
  await assertNoHorizontalOverflow(page);
});

test('quizzes give option-specific feedback and illustrations switch language, enlarge and download', async ({ page }) => {
  await visit(page, 'chapter/10');
  await setLocale(page, 'zh');
  const options = page.locator('.quiz-option');
  const feedback = new Set<string>();
  const outcomes = new Set<string>();
  for (const option of await options.all()) {
    await option.click();
    await expect(option).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.quiz-option[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator('#quiz-feedback')).toBeVisible();
    feedback.add(await page.locator('#quiz-feedback').innerText());
    outcomes.add((await page.locator('#quiz-feedback').getAttribute('class'))!.split(' ').at(-1)!);
  }
  expect(feedback.size).toBe(await options.count());
  expect(outcomes).toEqual(new Set(['correct', 'incorrect']));

  await expect(page.locator('.lesson-figure img')).toHaveAttribute('src', /-zh\.webp$/);
  await setLocale(page, 'en');
  await expect(page.locator('.lesson-heading-line > span')).toHaveText('10');
  await expect(page.locator('.lesson-figure img')).toHaveAttribute('src', /-en\.webp$/);
  await page.locator('.figure-zoom').click();
  await expect(page.locator('#figure-dialog')).toBeVisible();
  await assertImagesLoaded(page, '#figure-dialog img', 'en');
  const link = page.locator('#figure-dialog a[download]');
  await expect(link).toHaveAccessibleName('Download image');
  await expect(link).toHaveAttribute('download', 'llm-atlas-attention-en.webp');
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  expect(download.suggestedFilename()).toBe('llm-atlas-attention-en.webp');
  expect(await download.failure()).toBeNull();
  await page.locator('[data-close-figure]').click();
  await expect(page.locator('#figure-dialog')).not.toBeVisible();
  await expect(page.locator('.figure-zoom')).toBeFocused();
});

test('lab interactions calculate, mask, replay and handle missing or unsafe text', async ({ page }) => {
  await visit(page, 'lab/gradient');
  await setLocale(page, 'en');
  await expect(page.locator('.lab-metric').nth(1).locator('strong')).toHaveText('-3');
  await page.locator('[data-action="step"]').click();
  await expect(page.locator('.lab-metric').nth(0).locator('strong')).toHaveText('1');
  await expect(page.locator('.lab-metric').nth(1).locator('strong')).toHaveText('-1');
  await page.locator('[data-action="reset"]').click();
  await expect(page.locator('.lab-metric').nth(1).locator('strong')).toHaveText('-3');

  await visit(page, 'lab/attention');
  await expect(page.locator('.lab-metric').nth(1).locator('strong')).toHaveText('[0.802, 0.797]');
  await page.locator('[name="position"]').selectOption('1');
  const future = page.locator('.lab-heatmap tr.selected td').last();
  await expect(future).toHaveClass('masked');
  await expect(future).toHaveText('0masked');
  await page.locator('[name="q1"]').focus();
  await page.keyboard.press('End');
  await expect(future).toHaveText('0masked');
  await page.locator('[name="mask"]').selectOption('all');
  await expect(page.locator('.lab-heatmap tr.selected td').last()).not.toHaveClass('masked');

  await visit(page, 'lab/generation');
  for (let i = 0; i < 6; i++) await page.locator('[data-action="step"]').click();
  const first = await page.locator('.lab-token-stream').innerText();
  await page.locator('[data-action="reset"]').click();
  for (let i = 0; i < 6; i++) await page.locator('[data-action="step"]').click();
  await expect.poll(() => page.locator('.lab-token-stream').innerText()).toBe(first);
  await page.locator('[name="temperature"]').focus();
  await page.keyboard.press('Home');
  await page.locator('[name="topP"]').focus();
  await page.keyboard.press('Home');
  for (let i = 0; i < 4; i++) await page.locator('[data-action="step"]').click();
  await expect(page.locator('.lab-token-stream .lab-token b')).toHaveText(['temperature', 'is', 'rising', '.', '[EOS]']);

  await visit(page, 'lab/tokenizer');
  await page.locator('[name="text"]').fill('');
  await page.locator('[data-action="step"]').click();
  await expect(page.locator('.lab-token-stream')).toContainText('Enter text');

  await visit(page, 'lab/retrieval');
  await page.locator('[name="query"]').fill('zxqvnevermatch98317');
  await expect(page.locator('.lab-no-evidence')).toBeVisible();
  await page.locator('[name="query"]').fill('<img src=x onerror=alert(1)>');
  await expect(page.locator('#lab-host img')).toHaveCount(0);
  await expect(page.locator('.lab-context pre')).toContainText('<img src=x onerror=alert(1)>');
  await assertNoHorizontalOverflow(page);
});

test('active chapters and sidebar position survive adjacent navigation', async ({ page }) => {
  await visit(page, 'chapter/14');
  const sidebar = page.locator('.sidebar-scroll');
  const position = await sidebar.evaluate(element => { element.scrollTop = element.scrollHeight; return element.scrollTop; });
  await page.locator('.lesson-pagination a[href="#/chapter/15"]').click();
  await expect(page.locator('.lesson-heading-line > span')).toHaveText('15');
  await expect(page.locator('[data-chapter="15"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.chapter-nav [aria-current="page"]')).toHaveCount(1);
  expect(await page.locator('[data-chapter="15"]').evaluate(node => node.closest('details')?.open)).toBe(true);
  expect(Math.abs(await sidebar.evaluate(element => element.scrollTop) - position)).toBeLessThanOrEqual(2);
  await setLocale(page, 'en');
  await expect(page.locator('[data-chapter="15"]')).toHaveAttribute('aria-current', 'page');
  expect(await page.locator('[data-chapter="15"]').evaluate(node => node.closest('details')?.open)).toBe(true);
});

test('mobile navigation manages focus, inert backgrounds and closing', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'The navigation drawer exists only at the mobile breakpoint.');
  await visit(page, 'chapter/10');
  const toggle = page.locator('#menu-toggle');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#sidebar')).toHaveJSProperty('inert', true);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#sidebar')).toHaveJSProperty('inert', false);
  await expect(page.locator('.workspace')).toHaveJSProperty('inert', true);
  await expect(page.locator('.main-nav a').first()).toBeFocused();
  await page.locator('.sidebar-footer a').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('.brand')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('.sidebar-footer a')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await expect(page.locator('.workspace')).toHaveJSProperty('inert', false);
  await expect(page.locator('#sidebar')).toHaveJSProperty('inert', true);
  await toggle.click();
  await page.locator('[data-chapter="11"]').click();
  await expect(page.locator('.lesson-heading-line > span')).toHaveText('11');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#page')).toBeFocused();
});

test('appearance and text-size preferences survive a reload', async ({ page }) => {
  await visit(page, 'chapter/01');
  await page.locator('#theme-toggle').click(); // system -> light
  await page.locator('#theme-toggle').click(); // light -> dark
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#text-size').click();
  await expect(page.locator('#text-size')).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-text', 'large');
  await expect(page.locator('#text-size')).toHaveAttribute('aria-pressed', 'true');
  await assertNoHorizontalOverflow(page);
});
