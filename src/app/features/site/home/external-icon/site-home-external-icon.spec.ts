import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { SiteHomeExternalIcon } from './site-home-external-icon';

describe('SiteHomeExternalIcon', () => {
  it('should hide the icon and announce the new tab', async () => {
    const { container } = await render(SiteHomeExternalIcon, {
      imports: [getTranslocoTestingModule()],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTranslocoScope('site')],
    });

    expect(screen.getByText('site.home.newTab')).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
