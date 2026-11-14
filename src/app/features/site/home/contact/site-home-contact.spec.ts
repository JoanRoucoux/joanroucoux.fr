import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';

import { type SiteLang } from '@core/i18n/site-lang';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { FluidLoop } from '../fluid/fluid-loop';
import { HOME_LINKS } from '../site-home-links';
import { SiteHomeContact } from './site-home-contact';

describe('SiteHomeContact', () => {
  const renderContact = (lang: SiteLang = 'fr'): Promise<{ container: Element }> =>
    render(SiteHomeContact, {
      imports: [getTranslocoTestingModule()],
      inputs: { lang },
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTranslocoScope('site'), FluidLoop],
    });

  it('should title the block with a level 2 heading', async () => {
    await renderContact();

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('site.home.contact.title');
    expect(screen.getByText('site.home.contact.question')).toBeInTheDocument();
  });

  it('should open the mail client from the email button, in the same tab', async () => {
    await renderContact();

    const link = screen.getByRole('link', { name: HOME_LINKS.email });
    expect(link).toHaveAttribute('href', `mailto:${HOME_LINKS.email}`);
    expect(link).not.toHaveAttribute('target');
  });

  it.each([
    ['linkedin', HOME_LINKS.linkedin],
    ['github', HOME_LINKS.github],
    ['devto', HOME_LINKS.devto],
    ['cv', HOME_LINKS.cv],
  ])('should open %s in a new tab', async (key, href) => {
    await renderContact();

    const link = screen.getByRole('link', { name: new RegExp(`contact.${key}.*newTab`) });
    expect(link).toHaveAttribute('href', href);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
  });

  it('should mount a flat backdrop and keep the footer landmark', async () => {
    const { container } = await renderContact();

    expect(container.querySelector('app-site-home-fluid-backdrop')).toHaveAttribute('data-fluid', 'flat');
    expect(container.querySelector('section')).toBeNull();
    expect(container.querySelector('app-site-home-fluid-backdrop')?.parentElement).toHaveClass('contact');
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
