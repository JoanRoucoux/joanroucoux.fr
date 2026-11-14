import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { type RenderResult, render, screen } from '@testing-library/angular';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { AVAILABILITY, availabilityBadge } from './availability';
import { SiteHomePage } from './site-home-page';

describe('SiteHomePage', () => {
  const renderPage = (): Promise<RenderResult<SiteHomePage>> =>
    render(SiteHomePage, {
      imports: [getTranslocoTestingModule()],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTranslocoScope('site')],
    });

  it('should render the page heading', async () => {
    await renderPage();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Joan Roucoux');
  });

  it('should mount the halo first, flat and hidden from assistive technologies', async () => {
    const { container } = await renderPage();

    const halo = container.querySelector('app-site-home-fluid-halo');
    expect(halo).toHaveAttribute('data-fluid', 'flat');
    expect(halo).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstElementChild).toBe(halo);
  });

  it('should pass the availability to the hero', async () => {
    await renderPage();

    const badge = availabilityBadge(AVAILABILITY, 'fr');
    expect(screen.getByTestId('stage')).toHaveTextContent(badge.key);
  });

  it('should hold the fact sheet in the slot below the hero, with the computed years', async () => {
    const { container } = await renderPage();

    const slot = container.querySelector('.fiche-slot');
    expect(slot).toContainElement(screen.getByTestId('fact-sheet'));
    expect(screen.getByTestId('fact-sheet')).toHaveTextContent('site.home.facts.experienceValue');
  });
});
