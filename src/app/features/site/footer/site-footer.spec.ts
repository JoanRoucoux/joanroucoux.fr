import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen, within } from '@testing-library/angular';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { SiteFooter } from './site-footer';

describe('SiteFooter', () => {
  const renderFooter = (lang: 'fr' | 'en', page: 'home' | 'legal'): Promise<unknown> =>
    render(SiteFooter, {
      inputs: { lang, page },
      imports: [getTranslocoTestingModule()],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTranslocoScope('site')],
    });

  it('should link to the French legal notice on French pages', async () => {
    await renderFooter('fr', 'home');

    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'site.footer.legal' })).toHaveAttribute(
      'href',
      '/mentions-legales',
    );
  });

  it('should link to the English legal notice on English pages', async () => {
    await renderFooter('en', 'home');

    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'site.footer.legal' })).toHaveAttribute(
      'href',
      '/en/legal',
    );
  });

  it('should render the language switch for the given page', async () => {
    await renderFooter('fr', 'legal');

    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en/legal');
  });
});
