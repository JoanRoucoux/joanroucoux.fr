import { provideZonelessChangeDetection } from '@angular/core';

import { render, screen } from '@testing-library/angular';

import type { Experience } from '../experiences';
import { SiteHomeExperienceLogo } from './site-home-experience-logo';

describe('SiteHomeExperienceLogo', () => {
  const renderLogo = (logo: Experience['logo']): Promise<unknown> =>
    render(SiteHomeExperienceLogo, {
      providers: [provideZonelessChangeDetection()],
      inputs: { logo: logo, label: 'Organisation' },
    });

  it('should render the Caisse des Depots logo as a lazy image named after the organisation', async () => {
    await renderLogo('cdc');

    const image = screen.getByRole('img', { name: 'Organisation' });
    expect(image).toHaveAttribute('src', '/images/logos/cdc.svg');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('should render the Societe Generale tile as a labelled image role', async () => {
    await renderLogo('sg');

    expect(screen.getByRole('img', { name: 'Organisation' })).toHaveClass('logo', 'sg');
  });

  it('should write the name inside the Orange tile', async () => {
    await renderLogo('orange');

    expect(screen.getByRole('img', { name: 'Organisation' })).toHaveTextContent('orange');
  });

  it('should hide the decorative school tile from assistive technology', async () => {
    await renderLogo('cap');

    expect(screen.queryByRole('img')).toBeNull();
    expect(document.querySelector('.logo.cap')).toHaveAttribute('aria-hidden', 'true');
  });
});
