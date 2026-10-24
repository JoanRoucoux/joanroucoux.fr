import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { SitePage } from './site-page';

describe('SitePage', () => {
  it('should render the page heading', async () => {
    await render(SitePage, {
      imports: [getTranslocoTestingModule()],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTranslocoScope('site')],
    });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('site.title');
  });
});
