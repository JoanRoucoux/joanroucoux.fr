import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';

import { type SiteLang } from '@core/i18n/site-lang';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { type Availability } from '../availability';
import { FluidLoop } from '../fluid/fluid-loop';
import { HOME_LINKS } from '../site-home-links';
import { SiteHomeHero } from './site-home-hero';

describe('SiteHomeHero', () => {
  const renderHero = ({
    lang = 'fr',
    availability = { state: 'mission' },
  }: { lang?: SiteLang; availability?: Availability } = {}): Promise<unknown> =>
    render(SiteHomeHero, {
      imports: [getTranslocoTestingModule()],
      inputs: { lang, availability },
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTranslocoScope('site'), FluidLoop],
    });

  it('should name the person in the heading', async () => {
    await renderHero();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Joan Roucoux');
  });

  it.each([
    [{ state: 'mission' }, 'site.home.hero.badge.mission', 'amber'],
    [{ state: 'available' }, 'site.home.hero.badge.available', 'green'],
  ] as const)('should show the badge of %j', async (availability, key, tone) => {
    await renderHero({ availability });

    const badge = screen.getByText(key).closest('[data-tone]');
    expect(badge).toHaveAttribute('data-tone', tone);
  });

  it('should keep the contact link on the page of the language', async () => {
    await renderHero();
    expect(screen.getByRole('link', { name: 'site.home.hero.write' })).toHaveAttribute('href', '/#contact');
  });

  it('should keep the contact link on the English page', async () => {
    await renderHero({ lang: 'en' });
    expect(screen.getByRole('link', { name: 'site.home.hero.write' })).toHaveAttribute('href', '/en#contact');
  });

  it('should open the CV in a new tab', async () => {
    await renderHero();

    const link = screen.getByRole('link', { name: 'site.home.hero.cv site.home.newTab' });
    expect(link).toHaveAttribute('href', HOME_LINKS.cv);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
  });
});
