import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen, within } from '@testing-library/angular';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { FluidAtlas } from '../fluid/fluid-atlas';
import { FluidLoop } from '../fluid/fluid-loop';
import { SiteHomeExperiences } from './site-home-experiences';

describe('SiteHomeExperiences', () => {
  const renderExperiences = (): Promise<unknown> =>
    render(SiteHomeExperiences, {
      imports: [getTranslocoTestingModule()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideTranslocoScope('site'),
        FluidLoop,
        FluidAtlas,
      ],
    });

  const entries = (): HTMLElement[] => screen.getAllByRole('article');

  it('should render the section head first and the timeline right after it', async () => {
    await renderExperiences();

    const head = screen.getByTestId('section-head');
    expect(head).toHaveTextContent('site.home.experiences.title');
    expect(head.parentElement?.children).toHaveLength(2);
    expect(head.nextElementSibling).toBe(screen.getByTestId('experiences-timeline'));
    expect(head.nextElementSibling).toHaveClass('tl');
  });

  it('should list five entries, with a disclosure in the first two only', async () => {
    await renderExperiences();

    expect(screen.getByTestId('experiences-timeline')).toHaveRole('list');
    expect(entries()).toHaveLength(5);
    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(2);
    expect(entries()[0]).toContainElement(groups[0]!);
    expect(entries()[1]).toContainElement(groups[1]!);
    expect(within(entries()[2]!).queryByRole('group')).toBeNull();
  });

  it('should describe each disclosure by the title of its own entry', async () => {
    await renderExperiences();

    const summaries = screen.getAllByText('site.home.experiences.more');
    expect(summaries).toHaveLength(2);
    const roles = ['cdc', 'sgLead'];
    summaries.forEach((summary, index) => {
      const title = document.getElementById(summary.getAttribute('aria-describedby')!);
      expect(title).toHaveRole('heading');
      expect(title).toHaveTextContent('site.home.experiences.items.' + roles[index] + '.role');
    });
  });

  it('should keep the detail points in the markup of a closed disclosure', async () => {
    await renderExperiences();

    expect(screen.getAllByRole('group')[0]).not.toHaveAttribute('open');
    expect(screen.getByText('site.home.experiences.items.cdc.details.4')).toBeInTheDocument();
    expect(screen.getByText('site.home.experiences.items.sgLead.details.5')).toBeInTheDocument();
  });

  it('should show the figures of the first entry', async () => {
    await renderExperiences();

    const first = entries()[0]!;
    expect(first).toHaveTextContent('site.home.experiences.items.cdc.facts.1.value');
    expect(first).toHaveTextContent('site.home.experiences.items.cdc.facts.2.value');
    expect(first).not.toHaveClass('solo');
  });

  it('should mark entries without figures as solo and give the last one no list of points', async () => {
    await renderExperiences();

    expect(entries()[3]).toHaveClass('solo');
    const last = entries()[4]!;
    expect(last).toHaveClass('solo');
    expect(within(last).queryAllByRole('listitem')).toHaveLength(0);
    expect(last.closest('li')?.querySelector('.logo')).toHaveAttribute('aria-hidden', 'true');
  });

  it('should name the logos after their organisation', async () => {
    await renderExperiences();

    expect(screen.getByRole('img', { name: 'site.home.experiences.items.sgLead.org' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'site.home.experiences.items.sgDev.org' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'site.home.experiences.items.orange.org' })).toBeInTheDocument();
    const cdc = screen.getByRole('img', { name: 'site.home.experiences.items.cdc.org' });
    expect(cdc).toHaveAttribute('src', '/images/logos/cdc.svg');
    expect(cdc).toHaveAttribute('width');
    expect(cdc).toHaveAttribute('height');
    expect(cdc).toHaveAttribute('loading', 'lazy');
  });

  it('should title each entry with a level 3 heading carrying a unique id', async () => {
    await renderExperiences();

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(5);
    expect(new Set(headings.map((heading) => heading.id)).size).toBe(5);
    expect(headings[0]).toHaveTextContent('site.home.experiences.items.cdc.role');
  });
});
