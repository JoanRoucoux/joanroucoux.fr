import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { render, screen } from '@testing-library/angular';

import { LangSwitch } from './lang-switch';

describe('LangSwitch', () => {
  const renderSwitch = (lang: 'fr' | 'en', page: 'home' | 'legal'): Promise<unknown> =>
    render(LangSwitch, {
      inputs: { lang, page },
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });

  it('should link to the English home from the French home', async () => {
    await renderSwitch('fr', 'home');

    const link = screen.getByRole('link', { name: 'English' });
    expect(link).toHaveAttribute('href', '/en');
    expect(link).toHaveAttribute('hreflang', 'en');
  });

  it('should show the current language as text, not as a link', async () => {
    await renderSwitch('fr', 'home');

    expect(screen.queryByRole('link', { name: 'Français' })).not.toBeInTheDocument();
    expect(screen.getByText('Français')).toHaveAttribute('aria-current', 'true');
  });

  it('should link to the French legal notice from the English one', async () => {
    await renderSwitch('en', 'legal');

    const link = screen.getByRole('link', { name: 'Français' });
    expect(link).toHaveAttribute('href', '/mentions-legales');
    expect(link).toHaveAttribute('hreflang', 'fr');
    expect(screen.getByText('English')).toHaveAttribute('aria-current', 'true');
  });

  it('should label the navigation in the page language', async () => {
    await renderSwitch('fr', 'home');

    expect(screen.getByRole('navigation', { name: 'Langue' })).toBeInTheDocument();
  });

  it('should label the navigation in English on English pages', async () => {
    await renderSwitch('en', 'home');

    expect(screen.getByRole('navigation', { name: 'Language' })).toBeInTheDocument();
  });
});
