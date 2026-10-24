import { provideZonelessChangeDetection } from '@angular/core';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { LegalPage } from './legal-page';

describe('LegalPage', () => {
  it('should render the page heading', async () => {
    await render(LegalPage, {
      imports: [getTranslocoTestingModule()],
      providers: [provideZonelessChangeDetection(), provideTranslocoScope('site')],
    });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('site.legal.title');
  });
});
