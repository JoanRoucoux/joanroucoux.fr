import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { SiteHomeTechList } from './site-home-tech-list';
import type { TechId } from './tech';

describe('SiteHomeTechList', () => {
  const renderList = (inputs: { techs: readonly TechId[]; size?: 'md' | 'sm'; markCore?: boolean }): Promise<unknown> =>
    render(SiteHomeTechList, {
      inputs,
      imports: [getTranslocoTestingModule()],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTranslocoScope('site')],
    });

  it('should render a badge per tech, with its icon when it has one', async () => {
    await renderList({ techs: ['angular', 'hexagonal'] });
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Angular');
    expect(items[0]?.querySelector('img')).toHaveAttribute('src', '/images/tech/angular.svg');
    expect(items[1]).toHaveTextContent('site.home.tech.hexagonal');
    expect(items[1]?.querySelector('img')).toBeNull();
  });

  it('should ring the core stack only when asked', async () => {
    await renderList({ techs: ['angular', 'react'], markCore: true });
    const [angular, react] = screen.getAllByRole('listitem');
    expect(angular).toHaveClass('core');
    expect(react).not.toHaveClass('core');
  });

  it('should not ring the core stack by default', async () => {
    await renderList({ techs: ['angular'] });
    expect(screen.getByRole('listitem')).not.toHaveClass('core');
  });

  it('should shrink the badges on the small size', async () => {
    await renderList({ techs: ['angular'], size: 'sm' });
    expect(screen.getByRole('list')).toHaveClass('sm');
  });
});
