import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen, within } from '@testing-library/angular';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import en from '../../../../i18n/site/en.json';
import fr from '../../../../i18n/site/fr.json';
import { LegalPage } from './legal-page';

describe('LegalPage', () => {
  const renderLegal = async (lang: 'fr' | 'en'): Promise<void> => {
    await render(LegalPage, {
      imports: [
        getTranslocoTestingModule({
          langs: { 'site/fr': fr, 'site/en': en, fr: {}, en: {} },
          translocoConfig: { availableLangs: ['en', 'fr'], defaultLang: lang },
        }),
      ],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTranslocoScope('site')],
    });
  };

  it('should render the page heading', async () => {
    await renderLegal('fr');

    expect(screen.getByRole('heading', { level: 1, name: 'Mentions légales' })).toBeInTheDocument();
  });

  it('should render the three French sections', async () => {
    await renderLegal('fr');

    expect(screen.getByRole('heading', { level: 2, name: 'Éditeur' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Hébergement' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Journaux du serveur' })).toBeInTheDocument();
  });

  it('should render the three English sections', async () => {
    await renderLegal('en');

    expect(screen.getByRole('heading', { level: 2, name: 'Publisher' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Hosting' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Server logs' })).toBeInTheDocument();
  });

  it.each([
    ['fr', 'OVH SAS, 2 rue Kellermann, 59100 Roubaix, France, tél. +33 9 72 10 10 07'],
    ['en', 'OVH SAS, 2 rue Kellermann, 59100 Roubaix, France, phone +33 9 72 10 10 07'],
  ] as const)('should show the host address and phone in %s', async (lang, host) => {
    await renderLegal(lang);

    expect(screen.getByText(host)).toBeInTheDocument();
  });

  it.each([
    ['fr', 'Société par actions simplifiée (SAS)', '1 000 €'],
    ['en', 'Simplified joint-stock company (SAS)', '€1,000'],
  ] as const)('should show the publisher company in %s', async (lang, form, capital) => {
    await renderLegal(lang);

    for (const value of ['JR CONSULTING', form, capital, '14 rue Bausset, 75015 Paris', 'Paris 992 182 626']) {
      expect(screen.getByText(value)).toBeInTheDocument();
    }
  });

  it('should link the contact address', async () => {
    await renderLegal('fr');

    expect(screen.getByRole('link', { name: 'joan.roucoux@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:joan.roucoux@gmail.com',
    );
  });

  it('should describe the server logs in French', async () => {
    await renderLegal('fr');

    const text = screen.getByTestId('legal-logs').textContent ?? '';
    for (const term of ['adresse IP masquée', 'page demandée', 'référent', 'agent utilisateur']) {
      expect(text).toContain(term);
    }
    expect(text).toContain('mesure d’audience');
    expect(text).toContain('sécurité');
    expect(text).toContain('90 jours');
    expect(text).toContain('Aucun cookie');
  });

  it('should describe the server logs in English', async () => {
    await renderLegal('en');

    const text = screen.getByTestId('legal-logs').textContent ?? '';
    for (const term of ['masked IP address', 'requested page', 'referrer', 'user agent']) {
      expect(text).toContain(term);
    }
    expect(text).toContain('audience measurement');
    expect(text).toContain('security');
    expect(text).toContain('90 days');
    expect(text).toContain('No cookie');
  });

  it('should render the footer with the language switch', async () => {
    await renderLegal('fr');

    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'English' })).toHaveAttribute(
      'href',
      '/en/legal',
    );
  });
});
