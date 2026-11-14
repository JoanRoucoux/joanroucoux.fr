import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen, within } from '@testing-library/angular';

import { type SiteLang } from '@core/i18n/site-lang';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { SiteHomeFooter } from './site-home-footer';

describe('SiteHomeFooter', () => {
  const renderFooter = (lang: SiteLang): Promise<unknown> =>
    render(SiteHomeFooter, {
      imports: [getTranslocoTestingModule()],
      inputs: { lang },
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTranslocoScope('site')],
    });

  it('should link the legal notice in English', async () => {
    await renderFooter('en');

    expect(
      within(screen.getByRole('contentinfo')).getByRole('link', { name: 'site.home.footer.legal' }),
    ).toHaveAttribute('href', '/en/legal');
  });

  it('should link the legal notice in French', async () => {
    await renderFooter('fr');

    expect(screen.getByRole('link', { name: 'site.home.footer.legal' })).toHaveAttribute('href', '/mentions-legales');
  });

  it('should keep the anchors on the English page', async () => {
    await renderFooter('en');

    expect(screen.getByRole('link', { name: 'site.home.footer.articles' })).toHaveAttribute('href', '/en#articles');
    expect(screen.getByRole('link', { name: 'site.home.footer.experiences' })).toHaveAttribute(
      'href',
      '/en#experience',
    );
  });

  it('should use the French anchors at the root', async () => {
    await renderFooter('fr');

    expect(screen.getByRole('link', { name: 'site.home.footer.skills' })).toHaveAttribute('href', '/#competences');
    expect(screen.getByRole('link', { name: 'site.home.footer.projects' })).toHaveAttribute('href', '/#projets');
  });

  it('should name the person and show the company with the current year', async () => {
    await renderFooter('fr');

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveTextContent('Joan Roucoux');
    expect(footer).toHaveTextContent('site.home.hero.role');
    expect(footer).toHaveTextContent(`JR Consulting, ${new Date().getFullYear()}`);
  });
});
