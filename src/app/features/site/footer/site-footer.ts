import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslocoPipe } from '@jsverse/transloco';

import { type SiteLang, type SitePageKey } from '@core/i18n/site-lang';

import { SITE_PATHS } from '../contract/site-paths';
import { LangSwitch } from '../lang-switch/lang-switch';

@Component({
  selector: 'app-site-footer',
  imports: [TranslocoPipe, RouterLink, LangSwitch],
  templateUrl: './site-footer.html',
})
export class SiteFooter {
  readonly lang = input.required<SiteLang>();
  readonly page = input.required<SitePageKey>();

  protected readonly legalUrl = computed(() => `/${SITE_PATHS.legal[this.lang()]}`);
}
