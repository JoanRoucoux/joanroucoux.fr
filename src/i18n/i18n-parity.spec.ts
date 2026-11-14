import en from './en.json';
import fr from './fr.json';
import siteEn from './site/en.json';
import siteFr from './site/fr.json';

const isGroup = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const paths = (value: unknown, prefix = ''): string[] =>
  isGroup(value)
    ? Object.entries(value).flatMap(([key, child]) => paths(child, prefix ? `${prefix}.${key}` : key))
    : [prefix];

const leaves = (value: unknown): unknown[] => (isGroup(value) ? Object.values(value).flatMap(leaves) : [value]);

describe('i18n parity', () => {
  it.each([
    ['global', fr, en],
    ['site', siteFr, siteEn],
  ])('should have the same keys in French and English (%s)', (_, french, english) => {
    expect(paths(english).sort()).toEqual(paths(french).sort());
  });

  it('should hold only non-empty strings, never an array', () => {
    for (const file of [fr, en, siteFr, siteEn]) {
      expect(leaves(file).filter((leaf) => typeof leaf !== 'string' || leaf === '')).toEqual([]);
    }
  });
});
