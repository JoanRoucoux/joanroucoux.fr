import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TranslocoService } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';

import { PageHead } from '@core/seo/page-head';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { App } from './app';

describe('App', () => {
  const renderApp = (): Promise<unknown> =>
    render(App, {
      imports: [getTranslocoTestingModule()],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });

  it('should render the main content area', async () => {
    await renderApp();

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should announce the current page in a live region', async () => {
    await renderApp();

    TestBed.inject(PageHead).title.set('Sample');

    expect(await screen.findByTestId('route-announcer')).toHaveTextContent('Sample');
  });

  it('should keep the document language in sync from the first page', async () => {
    await renderApp();

    TestBed.inject(TranslocoService).setActiveLang('fr');
    TestBed.tick();

    expect(document.documentElement.lang).toBe('fr');
  });
});
