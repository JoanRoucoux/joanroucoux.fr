import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './fixtures/accessibility';

test.use({ locale: 'en-US' });

test('displays the site page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Joan Roucoux');
  await expectNoAccessibilityViolations(page);
});

test('serves French at the root whatever the browser language, without cookies', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  expect(await page.evaluate(() => document.cookie)).toBe('');
});

test('switches to English through the language link', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('navigation').getByRole('link', { name: 'English' }).click();

  await expect(page).toHaveURL('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Français' })).toHaveAttribute('href', '/');
});

test('serves the legal notice routes in their language', async ({ page }) => {
  await page.goto('/mentions-legales');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

  await page.goto('/en/legal');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('links the legal notice from the footer in each language', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Mentions légales' })).toHaveAttribute(
    'href',
    '/mentions-legales',
  );

  await page.goto('/en');
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Legal notice' })).toHaveAttribute(
    'href',
    '/en/legal',
  );
});

for (const path of ['/', '/en', '/mentions-legales', '/en/legal']) {
  test(`has no accessibility violation on ${path}`, async ({ page }) => {
    await page.goto(path);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
}

test('draws the fluid live on the stage and in the first section title', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-testid="stage"] [data-fluid]').first()).toHaveAttribute('data-fluid', 'live');
  const title = page.locator('h2').first();
  await title.scrollIntoViewIfNeeded();
  await expect(title).toHaveClass(/\bon\b/);
});

type Counters = { __webglAsked: number; __draws: number };

test('stays flat and readable when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const counters = window as unknown as Counters;
    counters.__webglAsked = 0;
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (type === 'webgl' || type === 'experimental-webgl') {
        counters.__webglAsked++;
        return null;
      }
      return (original as (...args: unknown[]) => unknown).call(this, type, ...rest);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.locator('h2').first().scrollIntoViewIfNeeded();
  await page.locator('#contact').scrollIntoViewIfNeeded();

  await expect.poll(() => page.evaluate(() => (window as unknown as Counters).__webglAsked)).toBeGreaterThanOrEqual(3);
  const backdrops = page.locator('app-site-home-fluid-backdrop');
  await expect(backdrops).toHaveCount(2);
  for (const backdrop of await backdrops.all()) {
    await expect(backdrop).toHaveAttribute('data-fluid', 'flat');
  }
  await expect(page.locator('[data-testid="stage"] app-site-home-fluid-backdrop')).toHaveCSS(
    'background-color',
    'rgb(4, 4, 26)',
  );
  await expect(page.locator('h2.on')).toHaveCount(0);
  await expectNoAccessibilityViolations(page);
});

test('scrolls to the contact block from the English nav', async ({ page }) => {
  await page.goto('/en');

  await page.getByRole('navigation').getByRole('link', { name: 'Contact' }).click();

  await expect(page).toHaveURL('/en#contact');
  await expect(page.locator('#contact').getByRole('heading').first()).toBeInViewport();
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('draws one frame and stops under reduced motion', async ({ page }) => {
    await page.addInitScript(() => {
      const counters = window as unknown as Counters;
      counters.__draws = 0;
      const original = WebGLRenderingContext.prototype.drawArrays;
      WebGLRenderingContext.prototype.drawArrays = function (
        this: WebGLRenderingContext,
        ...args: [number, number, number]
      ) {
        counters.__draws++;
        return original.apply(this, args);
      };
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('[data-testid="stage"] [data-fluid]').first()).toHaveAttribute('data-fluid', 'live');
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished)));

    const draws = (): Promise<number> => page.evaluate(() => (window as unknown as Counters).__draws);
    const stage = page.getByTestId('stage');
    const before = await draws();
    await page.waitForTimeout(500);
    expect(before).toBeGreaterThan(0);
    expect(await draws()).toBe(before);

    const first = await stage.screenshot();
    await page.waitForTimeout(500);
    const second = await stage.screenshot();

    expect(second.equals(first)).toBe(true);
  });
});
