import { HOME_LINKS } from './site-home-links';

const targets = (value: unknown): string[] =>
  typeof value === 'string' ? [value] : Object.values(value as Record<string, unknown>).flatMap(targets);

describe('HOME_LINKS', () => {
  it('should point every external link to https', () => {
    const { email, cv, ...external } = HOME_LINKS;

    expect(email).toBe('joan.roucoux@gmail.com');
    expect(cv).toBe('/cv/joan-roucoux.pdf');
    expect(targets(external).filter((target) => !target.startsWith('https://'))).toEqual([]);
  });
});
