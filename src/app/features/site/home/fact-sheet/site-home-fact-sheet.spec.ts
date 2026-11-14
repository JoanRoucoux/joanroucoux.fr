import { provideZonelessChangeDetection } from '@angular/core';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { type Availability } from '../availability';
import { SiteHomeFactSheet } from './site-home-fact-sheet';

describe('SiteHomeFactSheet', () => {
  const renderSheet = (availability: Availability, years = 8): Promise<unknown> =>
    render(SiteHomeFactSheet, {
      imports: [
        getTranslocoTestingModule({
          langs: { 'site/en': { home: { facts: { experienceValue: '{{years}} years' } } } },
        }),
      ],
      inputs: { availability, years },
      providers: [provideZonelessChangeDetection(), provideTranslocoScope('site')],
    });

  it('should show the years of experience', async () => {
    await renderSheet({ state: 'mission' }, 8);

    expect(screen.getByText('8 years')).toBeInTheDocument();
  });

  it('should show the last mission only when available', async () => {
    await renderSheet({ state: 'available' });

    expect(screen.getByText('site.home.facts.lastMission')).toBeInTheDocument();
    expect(screen.queryByText('site.home.facts.currentMission')).not.toBeInTheDocument();
  });

  it('should show the current mission otherwise', async () => {
    await renderSheet({ state: 'mission' });

    expect(screen.getByText('site.home.facts.currentMission')).toBeInTheDocument();
    expect(screen.queryByText('site.home.facts.lastMission')).not.toBeInTheDocument();
  });
});
