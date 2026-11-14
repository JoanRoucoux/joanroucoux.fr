import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslocoPipe } from '@jsverse/transloco';

import { type SiteLang } from '@core/i18n/site-lang';

import { SITE_PATHS } from '../../contract/site-paths';
import { HOME_SECTIONS, type HomeSectionId } from '../site-home-sections';

const FOOTER_SECTIONS: readonly HomeSectionId[] = ['skills', 'projects', 'experiences', 'articles'];

@Component({
  selector: 'app-site-home-footer',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './site-home-footer.html',
  styleUrl: './site-home-footer.css',
})
export class SiteHomeFooter {
  readonly lang = input.required<SiteLang>();

  protected readonly sections = FOOTER_SECTIONS;
  protected readonly year = new Date().getFullYear();
  protected readonly homeUrl = computed(() => `/${SITE_PATHS.home[this.lang()]}`);
  protected readonly legalUrl = computed(() => `/${SITE_PATHS.legal[this.lang()]}`);

  protected readonly fragment = (id: HomeSectionId): string => HOME_SECTIONS[id][this.lang()];
}
