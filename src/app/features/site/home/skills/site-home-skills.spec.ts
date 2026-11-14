import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen, within } from '@testing-library/angular';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { FluidAtlas } from '../fluid/fluid-atlas';
import { FluidLoop } from '../fluid/fluid-loop';
import { SiteHomeSkills } from './site-home-skills';

describe('SiteHomeSkills', () => {
  const renderSkills = (): Promise<unknown> =>
    render(SiteHomeSkills, {
      imports: [getTranslocoTestingModule()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideTranslocoScope('site'),
        FluidLoop,
        FluidAtlas,
      ],
    });

  it('should render the section head first and one content element after it', async () => {
    await renderSkills();

    const head = screen.getByTestId('section-head');
    expect(head).toHaveTextContent('site.home.skills.title');
    expect(head).toHaveTextContent('site.home.skills.lede');
    expect(head.parentElement?.children).toHaveLength(2);
    expect(head.nextElementSibling).toHaveClass('card');
  });

  it('should render one level 3 heading per row', async () => {
    await renderSkills();

    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6);
  });

  it('should list the five technologies of the design row', async () => {
    await renderSkills();

    const row = screen.getByRole('heading', { level: 3, name: 'site.home.skills.rows.design' }).closest('li')!;
    expect(within(row).getAllByRole('listitem')).toHaveLength(5);
  });
});
