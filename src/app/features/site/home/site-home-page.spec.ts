import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { SiteHomePage } from './site-home-page';

describe('SiteHomePage', () => {
  it('should render the page heading', async () => {
    await render(SiteHomePage, {
      imports: [getTranslocoTestingModule()],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTranslocoScope('site')],
    });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('site.title');
  });
});
