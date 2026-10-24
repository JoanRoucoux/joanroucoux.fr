import { counterpartUrl } from './site-lang';

describe('counterpartUrl', () => {
  it('should point the French home to the English home', () => {
    expect(counterpartUrl('fr', 'home')).toBe('/en');
  });

  it('should point the English home to the French home', () => {
    expect(counterpartUrl('en', 'home')).toBe('/');
  });

  it('should point the French legal notice to the English one', () => {
    expect(counterpartUrl('fr', 'legal')).toBe('/en/legal');
  });

  it('should point the English legal notice to the French one', () => {
    expect(counterpartUrl('en', 'legal')).toBe('/mentions-legales');
  });
});
