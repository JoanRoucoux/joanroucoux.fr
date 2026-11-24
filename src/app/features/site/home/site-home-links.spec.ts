import { HOME_LINKS, TEMPORARY_LINK } from './site-home-links';

const targets = (value: unknown): string[] =>
  typeof value === 'string' ? [value] : Object.values(value as Record<string, unknown>).flatMap(targets);

describe('HOME_LINKS', () => {
  it('should point every external link to https', () => {
    const { email, ...external } = HOME_LINKS;

    expect(email).toBe('joan.roucoux@gmail.com');
    expect(targets(external).filter((target) => !target.startsWith('https://'))).toEqual([]);
  });

  it('should keep the CV on the temporary link until its target exists', () => {
    expect(HOME_LINKS.cv).toBe(TEMPORARY_LINK);
  });
});
