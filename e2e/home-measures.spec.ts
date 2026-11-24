import { type Page, expect, test } from '@playwright/test';

type Measures = {
  sheetY: number;
  sheetX: number;
  gaps: number[];
  heads: number[];
  ledes: number[];
  over: number;
};

const measure = (): Measures => {
  const box = (element: Element): DOMRect => element.getBoundingClientRect();
  const one = (id: string): Element => document.querySelector(`[data-testid="${id}"]`)!;
  const root = document.documentElement;
  const sheet = box(one('fact-sheet'));
  const sections = [...document.querySelectorAll('[data-testid="section"]')];
  const head = (section: Element): Element => section.querySelector('[data-testid="section-head"]')!;
  let previous = sheet.bottom;
  const gaps = sections.map((section) => {
    const gap = Math.round(box(head(section)).top - previous);
    previous = box(section).bottom;
    return gap;
  });
  gaps.push(Math.round(box(one('contact')).top - previous));
  return {
    sheetY: Math.round(sheet.top + sheet.height / 2 - box(one('stage')).bottom),
    sheetX: Math.round(sheet.left + sheet.width / 2 - root.clientWidth / 2),
    gaps,
    heads: sections.map((section) =>
      Math.round(box(head(section).nextElementSibling!).top - box(head(section)).bottom),
    ),
    ledes: [...document.querySelectorAll('[data-testid="lede"]')].map((lede) =>
      Math.round(box(lede).height / parseFloat(getComputedStyle(lede).lineHeight)),
    ),
    over: root.scrollWidth - root.clientWidth,
  };
};

const open = async (page: Page, path: string): Promise<void> => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path);
  await expect(page.getByTestId('fact-sheet')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-fluid="live"]').first()).toBeAttached();
};

const clientWidth = (page: Page): Promise<number> => page.evaluate(() => document.documentElement.clientWidth);

test.describe('desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const path of ['/', '/en']) {
    test(`holds the desktop measures on ${path}`, async ({ page }) => {
      await open(page, path);

      expect(await clientWidth(page)).toBe(1425);
      expect(await page.evaluate(measure)).toEqual({
        sheetY: 0,
        sheetX: 0,
        gaps: [128, 128, 128, 128, 128, 128],
        heads: [48, 48, 48, 48, 48],
        ledes: [1, 1, 1, 1, 1],
        over: 0,
      });
    });
  }
});

for (const [width, height] of [
  [768, 1024],
  [390, 844],
  [320, 640],
]) {
  test.describe(`touch ${width}px`, () => {
    test.use({ viewport: { width, height }, isMobile: true, hasTouch: true });

    for (const path of ['/', '/en']) {
      test(`has no overflow, the fact sheet on the hero edge and the mobile gaps on ${path}`, async ({ page }) => {
        await open(page, path);

        expect(await clientWidth(page)).toBe(width);
        const { over, sheetY, gaps } = await page.evaluate(measure);
        expect({ over, sheetY, gaps }).toEqual({ over: 0, sheetY: 0, gaps: [96, 96, 96, 96, 96, 96] });
      });
    }
  });
}
