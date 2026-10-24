import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_LANGS, type SiteLang, type SitePageKey, counterpartUrl } from '@core/i18n/site-lang';

const NAV_LABELS: Record<SiteLang, string> = { fr: 'Langue', en: 'Language' };

@Component({
  selector: 'app-lang-switch',
  imports: [RouterLink],
  templateUrl: './lang-switch.html',
})
export class LangSwitch {
  readonly lang = input.required<SiteLang>();
  readonly page = input.required<SitePageKey>();

  protected readonly langs = SITE_LANGS;
  protected readonly labels: Record<SiteLang, string> = { fr: 'Français', en: 'English' };

  protected readonly navLabel = computed(() => NAV_LABELS[this.lang()]);
  protected readonly url = computed(() => counterpartUrl(this.lang(), this.page()));
}
