import { Component, type ElementRef, Injector, afterNextRender, inject, signal, viewChildren } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { SiteHomeExternalIcon } from '../external-icon/site-home-external-icon';
import { SiteHomeSectionHead } from '../section-head/site-home-section-head';
import { HOME_LINKS } from '../site-home-links';
import { SiteHomeTechList } from '../tech/site-home-tech-list';
import { CAIRN, type CairnScreen, PROJECT_CARDS } from './projects';

@Component({
  selector: 'app-site-home-projects',
  imports: [TranslocoPipe, SiteHomeExternalIcon, SiteHomeSectionHead, SiteHomeTechList],
  templateUrl: './site-home-projects.html',
  styleUrl: './site-home-projects.css',
})
export class SiteHomeProjects {
  protected readonly cairn = CAIRN;
  protected readonly links = HOME_LINKS;
  protected readonly visibleCards = PROJECT_CARDS.filter((card) => !card.more);
  protected readonly extraCards = PROJECT_CARDS.filter((card) => card.more);
  protected readonly screen = signal<CairnScreen>('dashboard');
  protected readonly revealed = signal(false);

  readonly #injector = inject(Injector);
  private readonly tabs = viewChildren<ElementRef<HTMLButtonElement>>('tab');
  private readonly extraTitles = viewChildren<ElementRef<HTMLElement>>('extraTitle');

  protected onTabKeydown(event: KeyboardEvent): void {
    const screens = this.cairn.screens;
    const current = screens.indexOf(this.screen());
    const last = screens.length - 1;
    const targets: Record<string, number> = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    };
    const target = targets[event.key];
    if (target === undefined) {
      return;
    }
    event.preventDefault();
    this.screen.set(screens[target]!);
    this.tabs()[target]!.nativeElement.focus();
  }

  protected reveal(): void {
    this.revealed.set(true);
    afterNextRender(() => this.extraTitles()[0]!.nativeElement.focus(), { injector: this.#injector });
  }
}
