import { Component, inject } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { LanguageStore } from '@core/i18n/language-store';

import { SiteFooter } from './footer/site-footer';

@Component({
  selector: 'app-site-page',
  imports: [TranslocoPipe, SiteFooter],
  templateUrl: './site-page.html',
})
export class SitePage {
  protected readonly lang = inject(LanguageStore).activeLang;
}
