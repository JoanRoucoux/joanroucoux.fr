import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { FluidAtlas } from '../fluid/fluid-atlas';
import { FluidLoop } from '../fluid/fluid-loop';
import { SiteHomeCertifications } from './site-home-certifications';

describe('SiteHomeCertifications', () => {
  const renderCertifications = (): Promise<unknown> =>
    render(SiteHomeCertifications, {
      imports: [getTranslocoTestingModule()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideTranslocoScope('site'),
        FluidLoop,
        FluidAtlas,
      ],
    });

  it('should render the section head first and one content element after it', async () => {
    await renderCertifications();

    const head = screen.getByTestId('section-head');
    expect(head).toHaveTextContent('site.home.certifications.title');
    expect(head.parentElement?.children).toHaveLength(2);
    expect(head.nextElementSibling).toHaveClass('certs');
  });

  it('should render four cards', async () => {
    await renderCertifications();

    expect(screen.getAllByRole('article')).toHaveLength(4);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
  });

  it('should link three certifications to their verification in a new tab, not TOEIC', async () => {
    await renderCertifications();

    const links = screen.getAllByRole('link', { name: 'site.home.certifications.verify site.home.newTab' });
    expect(links).toHaveLength(3);
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener');
    });
  });

  it('should describe each verify link by the title of its own card', async () => {
    await renderCertifications();

    const [first] = screen.getAllByRole('link', { name: 'site.home.certifications.verify site.home.newTab' });
    const title = document.getElementById(first!.getAttribute('aria-describedby')!);
    expect(title).toHaveRole('heading');
    expect(title).toHaveTextContent('site.home.certifications.items.safe.title');
  });
});
