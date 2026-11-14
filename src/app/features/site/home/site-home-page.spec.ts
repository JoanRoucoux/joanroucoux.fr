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

  it('should mount skills, projects, experiences, certifications and articles in the main landmark, in page order', async () => {
    await renderPage();

    const sections = screen.getAllByTestId('section');
    expect(sections.map((section) => section.id)).toEqual([
      'skills',
      'projects',
      'experience',
      'certifications',
      'articles',
    ]);
    expect(screen.getByRole('main')).toContainElement(sections[0]!);
  });

  it('should end with the contact block, which holds the only footer', async () => {
    const { container } = await renderPage();

    const contact = screen.getByTestId('contact');
    expect(contact).toHaveAttribute('id', 'contact');
    expect(container.lastElementChild).toBe(contact);
    expect(screen.getByRole('main')).not.toContainElement(contact);
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
    expect(contact).toContainElement(screen.getByRole('contentinfo'));
  });
});
