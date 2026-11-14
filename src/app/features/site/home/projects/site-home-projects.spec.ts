import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { FluidAtlas } from '../fluid/fluid-atlas';
import { FluidLoop } from '../fluid/fluid-loop';
import { HOME_LINKS } from '../site-home-links';
import { SiteHomeProjects } from './site-home-projects';

describe('SiteHomeProjects', () => {
  const renderProjects = (): Promise<unknown> =>
    render(SiteHomeProjects, {
      imports: [getTranslocoTestingModule()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideTranslocoScope('site'),
        FluidLoop,
        FluidAtlas,
      ],
    });

  const desktopShot = (): HTMLElement => screen.getByTestId('cairn-desktop-shot');
  const mobileShot = (): HTMLElement => screen.getByTestId('cairn-mobile-shot');

  it('should render the section head first and one content element after it', async () => {
    await renderProjects();

    const head = screen.getByTestId('section-head');
    expect(head).toHaveTextContent('site.home.projects.title');
    expect(head.parentElement?.children).toHaveLength(2);
    expect(head.nextElementSibling).toBe(screen.getByTestId('projects-content'));
  });

  it('should switch the Cairn screen with the tabs and the arrow keys', async () => {
    const user = userEvent.setup();
    await renderProjects();
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(desktopShot()).toHaveAttribute('src', '/images/cairn/dashboard-desktop.webp');
    await user.click(tabs[1]!);
    expect(desktopShot()).toHaveAttribute('src', '/images/cairn/allocation-desktop.webp');
    await user.keyboard('{ArrowRight}');
    expect(tabs[2]).toHaveFocus();
    expect(mobileShot()).toHaveAttribute('src', '/images/cairn/holding-mobile.webp');
  });

  it('should wrap around, jump with Home and End and keep a roving tabindex', async () => {
    const user = userEvent.setup();
    await renderProjects();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);

    tabs[0]!.focus();
    await user.keyboard('{ArrowLeft}');
    expect(tabs[2]).toHaveFocus();
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    expect(tabs.map((tab) => tab.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);

    await user.keyboard('{ArrowRight}');
    expect(tabs[0]).toHaveFocus();

    await user.keyboard('{End}');
    expect(tabs[2]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(tabs[0]).toHaveFocus();
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowDown}');
    expect(tabs[0]).toHaveFocus();
  });

  it('should label the tablist and the panel by the selected tab', async () => {
    const user = userEvent.setup();
    await renderProjects();

    expect(screen.getByRole('tablist')).toHaveAccessibleName('site.home.projects.cairn.screensLabel');
    const tabs = screen.getAllByRole('tab');
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('site.home.projects.cairn.screens.dashboard');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('tabindex', '0');
    await user.click(tabs[2]!);
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAccessibleName('site.home.projects.cairn.screens.holding');
    expect(panel.getAttribute('aria-labelledby')).toBe(tabs[2]!.id);
    expect(tabs[2]!.getAttribute('aria-controls')).toBe(panel.id);
  });

  it('should give each screenshot its own alt text and intrinsic size', async () => {
    const user = userEvent.setup();
    await renderProjects();

    expect(desktopShot()).toHaveAttribute('alt', 'site.home.projects.cairn.alt.dashboard.desktop');
    expect(desktopShot()).toHaveAttribute('width', '1440');
    expect(desktopShot()).toHaveAttribute('loading', 'lazy');
    expect(desktopShot()).toHaveAttribute('decoding', 'async');
    expect(desktopShot()).toHaveAttribute('height', '900');
    expect(mobileShot()).toHaveAttribute('alt', 'site.home.projects.cairn.alt.dashboard.mobile');
    expect(mobileShot()).toHaveAttribute('width', '390');
    expect(mobileShot()).toHaveAttribute('loading', 'lazy');
    expect(mobileShot()).toHaveAttribute('decoding', 'async');
    expect(mobileShot()).toHaveAttribute('height', '844');
    await user.click(screen.getAllByRole('tab')[1]!);
    expect(mobileShot()).toHaveAttribute('src', '/images/cairn/allocation-mobile.webp');
    expect(mobileShot()).toHaveAttribute('alt', 'site.home.projects.cairn.alt.allocation.mobile');
  });

  it('should link Cairn to its three repositories in a new tab', async () => {
    await renderProjects();

    const name = (key: string): string => `site.home.projects.cairn.links.${key} site.home.newTab`;
    const links = [
      [name('back'), HOME_LINKS.cairn.back],
      [name('front'), HOME_LINKS.cairn.front],
      [name('storybook'), HOME_LINKS.cairn.storybook],
    ] as const;
    links.forEach(([label, href]) => {
      const link = screen.getByRole('link', { name: label });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener');
    });
  });

  it('should link each project card to its code and describe the link by the card title', async () => {
    await renderProjects();

    const ids = ['starters', 'infra', 'shortener', 'subtitles'] as const;
    const links = screen.getAllByRole('link', { name: 'site.home.projects.code site.home.newTab', hidden: true });
    expect(links.map((link) => link.getAttribute('href'))).toEqual(ids.map((id) => HOME_LINKS.projects[id]));
    links.forEach((link, index) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener');
      const title = document.getElementById(link.getAttribute('aria-describedby')!);
      expect(title).toHaveRole('heading');
      expect(title).toHaveTextContent('site.home.projects.cards.' + ids[index] + '.title');
    });
  });

  it('should reveal the extra projects and move focus to the first one', async () => {
    const user = userEvent.setup();
    await renderProjects();
    expect(screen.getByText('site.home.projects.cards.shortener.title')).not.toBeVisible();
    const more = screen.getByRole('button', { name: 'site.home.projects.more' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    await user.click(more);
    expect(screen.getByText('site.home.projects.cards.shortener.title')).toBeVisible();
    expect(screen.getByText('site.home.projects.cards.shortener.title')).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'site.home.projects.more' })).not.toBeInTheDocument();
    expect(within(screen.getByTestId('projects-content')).getAllByRole('heading', { level: 3 })).toHaveLength(5);
  });
});
