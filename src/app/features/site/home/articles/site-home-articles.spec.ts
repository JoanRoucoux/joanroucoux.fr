import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen, within } from '@testing-library/angular';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { FluidAtlas } from '../fluid/fluid-atlas';
import { FluidLoop } from '../fluid/fluid-loop';
import { HOME_LINKS } from '../site-home-links';
import { SiteHomeArticles } from './site-home-articles';

describe('SiteHomeArticles', () => {
  const renderArticles = (): Promise<unknown> =>
    render(SiteHomeArticles, {
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
    await renderArticles();

    const head = screen.getByTestId('section-head');
    expect(head).toHaveTextContent('site.home.articles.title');
    expect(head.parentElement?.children).toHaveLength(2);
    expect(head.nextElementSibling).toHaveClass('card');
  });

  it('should link the four articles to Dev.to in a new tab', async () => {
    await renderArticles();

    const links = screen.getAllByRole('link', { name: 'site.home.articles.read site.home.newTab' });
    expect(links.map((link) => link.getAttribute('href'))).toEqual(Object.values(HOME_LINKS.articles));
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener');
    });
  });

  it('should title each article with a level 3 heading holding a link to the article', async () => {
    await renderArticles();

    const heading = screen.getByRole('heading', {
      level: 3,
      name: 'site.home.articles.items.subtitles.title site.home.newTab',
    });
    const link = within(heading).getByRole('link');
    expect(link).toHaveAttribute('href', HOME_LINKS.articles.subtitles);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
  });

  it('should describe each read link by the heading of its own article', async () => {
    await renderArticles();

    const ids = ['subtitles', 'shortener', 'readme', 'marvel'] as const;
    const reads = screen.getAllByRole('link', { name: 'site.home.articles.read site.home.newTab' });
    reads.forEach((read, index) => {
      const heading = document.getElementById(read.getAttribute('aria-describedby')!);
      expect(heading).toHaveRole('heading');
      expect(heading).toHaveTextContent('site.home.articles.items.' + ids[index] + '.title');
    });
  });
});
