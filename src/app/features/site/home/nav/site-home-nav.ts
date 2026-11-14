import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslocoPipe } from '@jsverse/transloco';

import { type SiteLang } from '@core/i18n/site-lang';

import { SITE_PATHS } from '../../contract/site-paths';
import { LangSwitch } from '../../lang-switch/lang-switch';
import { HOME_SECTIONS, type HomeSectionId } from '../site-home-sections';

const NAV_SECTIONS: readonly HomeSectionId[] = ['skills', 'projects', 'experiences', 'contact'];

@Component({
  selector: 'app-site-home-nav',
  imports: [RouterLink, TranslocoPipe, LangSwitch],
  templateUrl: './site-home-nav.html',
  styleUrl: './site-home-nav.css',
})
export class SiteHomeNav {
  readonly lang = input.required<SiteLang>();

  protected readonly sections = NAV_SECTIONS;
  protected readonly homeUrl = computed(() => `/${SITE_PATHS.home[this.lang()]}`);

  protected readonly fragment = (id: HomeSectionId): string => HOME_SECTIONS[id][this.lang()];
}
