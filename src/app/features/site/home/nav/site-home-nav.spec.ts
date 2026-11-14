import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';

import { type SiteLang } from '@core/i18n/site-lang';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { SiteHomeNav } from './site-home-nav';

describe('SiteHomeNav', () => {
  const renderNav = ({ lang }: { lang: SiteLang }): Promise<unknown> =>
    render(SiteHomeNav, {
      imports: [getTranslocoTestingModule()],
      inputs: { lang },
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTranslocoScope('site')],
    });

  it('should keep the anchors on the English page', async () => {
    await renderNav({ lang: 'en' });

    expect(screen.getByRole('link', { name: 'site.home.nav.contact' })).toHaveAttribute('href', '/en#contact');
    expect(screen.getByRole('link', { name: 'site.home.nav.skills' })).toHaveAttribute('href', '/en#skills');
  });

  it('should use the French anchors at the root', async () => {
    await renderNav({ lang: 'fr' });

    expect(screen.getByRole('link', { name: 'site.home.nav.skills' })).toHaveAttribute('href', '/#competences');
  });

  it('should label the navigation and hold the language switch', async () => {
    await renderNav({ lang: 'fr' });

    const nav = screen.getByRole('navigation', { name: 'site.home.nav.label' });
    expect(nav).toContainElement(screen.getByRole('group', { name: 'Langue' }));
    expect(screen.getAllByRole('link')).toHaveLength(5);
  });
});
